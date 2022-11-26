import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { WhereOptions } from "sequelize";
import jwt from "jsonwebtoken";
import {
  createDatabaseEntry,
  readDatabaseEntry,
  readAllDatabaseEntries,
  updateDatabaseEntry,
  deleteDatabaseEntry,
  UserObj,
  sendError,
  sendOK,
} from "../util";
import { Token, User } from "../sequelize";
import { getTokenSecret } from "../middleware/auth";
const password = require("s-salt-pepper");

export const router = express.Router();

const MODIFIABLE_USER_PROPERTIES = ["name", "surname", "email"];
/** The number of milliseconds a newly-generated access token should be valid for. */
const TOKEN_VALID_FOR_MS = 30 * 60 * 1000; // 30 mins

/** Authenticate given password against the stored credentials in the database. */
async function authenticateUser(
  res: Response,
  filter: WhereOptions,
  pw: string
) {
  if (!pw) {
    throw Error("Password not provided.");
  }

  const records = await readDatabaseEntry(User, res, filter, () => {
    const property = Object.keys(filter).shift();
    sendError(res, 400, { message: `Invalid ${property}.` });
  });
  if (!records) return;
  const userRecord = records.shift() as User;
  const { hash, salt, ...userDetails } = userRecord.get();
  const isValid = await password.compare(pw, { hash, salt });
  if (!isValid) throw Error("Invalid password.");
  return userDetails;
}

function generateAccessToken(user: UserObj) {
  const payload = { ...user, iat: new Date().getTime() };
  const signOptions = { expiresIn: TOKEN_VALID_FOR_MS };
  const accessToken = jwt.sign(payload, getTokenSecret("access"), signOptions);
  const tokenInfo = jwt.decode(accessToken) as jwt.JwtPayload;
  return { accessToken, expiresAt: tokenInfo.exp };
}

function sendNewTokens(res: Response, user: UserObj) {
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign({ uuid: user.uuid }, getTokenSecret("refresh"));
  Token.create({ value: refreshToken }).then();
  sendOK(res, { ...user, ...accessToken, refreshToken }, 201);
}

router
  // CREATE new account
  .post("/users", async (req: Request, res: Response) => {
    for (const requiredProperty of ["name", "surname", "email", "password"]) {
      if (!req.body[requiredProperty]) {
        return sendError(res, 400, {
          message: `Invalid account details. No ${requiredProperty} specified.`,
        });
      }
    }
    // Check for existing entries
    const results = await readDatabaseEntry(
      User,
      res,
      { email: req.body.email },
      () => null
    );

    if (results?.shift()) {
      return sendError(res, 400, {
        message: "A user with that email address already exists.",
      });
    }
    // Hash password
    const credentials: { hash: string; salt: string } = await password.hash(
      req.body.password
    );

    await createDatabaseEntry(
      User,
      req,
      res,
      {
        uuid: uuidv4(),
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        ...credentials,
      },
      (_res: Response, record: User) => {
        const { hash, salt, ...userData } = record.get();
        sendNewTokens(res, userData);
      }
    );
  })

  // POST login details
  .post("/user", async (req: Request, res: Response) => {
    function reject(message: string) {
      sendError(res, 400, { message });
    }

    const { password: pw, email } = req.body;

    if (!email) return reject("Email not provided.");

    let userData;
    try {
      userData = await authenticateUser(res, { email }, pw);
    } catch (err) {
      return void reject((err as Error).message);
    }
    if (!userData) return;
    sendNewTokens(res, userData);
  })

  // CREATE new access JWT
  .post("/token", async (req: Request, res: Response) => {
    const reject = (message: string) => sendError(res, 400, { message });

    const refreshToken = req.body.token;
    if (!refreshToken) return reject("No refresh token provided.");
    const tokens = await readDatabaseEntry(
      Token,
      res,
      { value: refreshToken },
      () => {
        reject("The provided refresh token was not issued by this server.");
      }
    );
    if (!tokens) return;
    jwt.verify(
      refreshToken as string,
      getTokenSecret("refresh"),
      (err, user) => {
        if (err) return reject("Invalid or expired refresh token.");

        sendOK(res, generateAccessToken(user as UserObj), 201);
      }
    );
  })

  // READ all users
  .get("/users", async (_req: Request, res: Response) => {
    await readAllDatabaseEntries(User, res, (users) => {
      sendOK(
        res,
        users.map((user: User) => {
          const { hash, salt, ...publicProperties } = user.get();
          return publicProperties;
        })
      );
    });
  })

  // READ specific user
  .get("/user", async (req: Request, res: Response) => {
    const results = await readDatabaseEntry(User, res, req.query);
    if (results) {
      sendOK(res, results);
    }
  })

  // DELETE existing user
  .delete("/user/:uuid", async (req: Request, res: Response) => {
    await deleteDatabaseEntry(User, { uuid: req.params.uuid }, res);
  })

  // DELETE user token
  .delete("/token", async (req: Request, res: Response) => {
    function reject(message: string) {
      sendError(res, 400, { message });
    }
    const refreshToken = req.body.token;
    if (!refreshToken) {
      return void reject("No refresh token provided.");
    }

    await deleteDatabaseEntry(Token, { value: refreshToken }, res);
  })

  // UPDATE existing user details
  .put("/user/:uuid/details", async (req: Request, res: Response) => {
    for (const property in req.body) {
      if (MODIFIABLE_USER_PROPERTIES.includes(property)) {
        continue;
      }
      if (req.user?.admin) {
        continue;
      }
      return sendError(res, 403, {
        message: `Protected user property '${property}'.`,
      });
    }

    await updateDatabaseEntry(User, req, res);
  })

  // UPDATE existing user password
  .put("/user/:uuid/password", async (req: Request, res: Response) => {
    function reject(message: string) {
      sendError(res, 400, { message });
    }

    if (!req.body.oldPassword) {
      return reject("Old password not provided.");
    }
    try {
      const success = await authenticateUser(
        res,
        req.params,
        req.body.oldPassword
      );
      if (!success) return;
    } catch (e) {
      const err = e as Error;
      return reject(
        err.message === "Password not provided."
          ? "Old password not provided."
          : err.message
      );
    }
    const credentials: { hash: string; salt: string } = await password.hash(
      req.body.newPassword
    );
    await updateDatabaseEntry(
      User,
      { params: req.params, body: credentials } as Request,
      res
    );
  });
