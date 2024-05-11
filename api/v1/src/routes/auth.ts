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
  sendError,
  sendOK,
} from "../util";
import { LikedShows, Token, User, WatchedEpisodes } from "../sequelize";
import { getTokenSecret } from "../middleware/auth";
import { UserObj } from "../models";
import { getLogger } from "../middleware/logging";
const password = require("s-salt-pepper");

export const router = express.Router();
const logger = getLogger(__filename);

const MODIFIABLE_USER_PROPERTIES = ["username", "email"];

const ADMIN_USER_PROPERTIES = ["uuid", "admin", "created_at", "modified_at"];

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
  const userRecord = records[0];
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
  const refreshToken = jwt.sign(user, getTokenSecret("refresh"));
  Token.create({ value: refreshToken }).then();
  sendOK(res, { ...user, ...accessToken, refreshToken }, 201);
}

const removeSensitiveData = (users: User[]) =>
  users.map((user) => {
    const { hash, salt, ...publicProperties } = user.get();
    return publicProperties;
  });

const sendUsers = (res: Response, returnOnlyUsernames: boolean) =>
  readAllDatabaseEntries(User, res, (users) => {
    sendOK(
      res,
      returnOnlyUsernames
        ? Object.fromEntries(
            users.map((user: User) => [user.get("uuid"), user.get("username")])
          )
        : removeSensitiveData(users)
    );
  });

router
  // CREATE new account
  .post("/users", async (req: Request, res: Response) => {
    for (const requiredProperty of ["username", "email", "password"]) {
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
        username: req.body.username,
        email: req.body.email,
        ...credentials,
      },
      (_res: Response, record: User) => {
        const { hash, salt, ...userData } = record.get();
        sendNewTokens(res, userData);
      }
    );
  })

  // READ all users
  .get("/users", (_req: Request, res: Response) => {
    sendUsers(res, false);
  })

  // READ specific user by search query
  .get("/users", async (req: Request, res: Response) => {
    const results = await readDatabaseEntry(User, res, req.query);
    if (results) sendOK(res, removeSensitiveData(results)[0]);
  })

  // READ specific user by uuid
  .get("/users/:uuid", async (req: Request, res: Response) => {
    const results = await readDatabaseEntry(User, res, req.params);
    if (results) sendOK(res, removeSensitiveData(results));
  })

  // UPDATE existing user details
  .put("/users/:uuid/details", async (req: Request, res: Response) => {
    for (const property in req.body) {
      if (MODIFIABLE_USER_PROPERTIES.includes(property)) continue;
      if (!req.user?.admin) {
        return sendError(res, 403, {
          message: `Protected user property '${property}'.`,
        });
      }
      if (ADMIN_USER_PROPERTIES.includes(property)) continue;

      return sendError(res, 400, {
        message: `Unmodifiable user property '${property}'.`,
      });
    }

    await updateDatabaseEntry(User, req, res);
  })

  // UPDATE existing user password
  .put("/users/:uuid/password", async (req: Request, res: Response) => {
    const reject = (message: string) => sendError(res, 400, { message });

    if (!req.user?.admin) {
      if (!req.body.oldPassword) return reject("Old password not provided.");

      // Validate the old password
      try {
        const success = await authenticateUser(
          res,
          req.params,
          req.body.oldPassword
        );
        if (!success) return;
      } catch (error) {
        const { message } = error as Error;
        // Update the error message to better reflect the situation
        return reject(message.replace(/^Password/, "Old password"));
      }
    }

    const credentials: { hash: string; salt: string } = await password.hash(
      req.body.newPassword
    );
    await updateDatabaseEntry(
      User,
      { params: req.params, body: credentials } as Request,
      res
    );
  })

  // DELETE existing user
  .delete("/users/:uuid", async (req: Request, res: Response) => {
    const uuid = req.params.uuid;
    if (!uuid)
      return sendError(res, 400, {
        message: "User UUID must be provided in request path.",
      });
    try {
      await deleteDatabaseEntry(LikedShows, { userUUID: uuid });
      await deleteDatabaseEntry(WatchedEpisodes, { userUUID: uuid });
    } catch (error) {
      logger.error(`Could not delete user-associated entries: ${error}`);
    }
    await deleteDatabaseEntry(User, { uuid }, res);
  })

  // READ all usernames
  .get("/usernames", (_req: Request, res: Response) => {
    sendUsers(res, true);
  })

  // CREATE refresh token
  .post("/tokens", async (req: Request, res: Response) => {
    const reject = (message: string) => sendError(res, 400, { message });

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

  // DELETE refresh token
  .delete("/tokens/:token", async (req: Request, res: Response) => {
    const reject = (message: string) => sendError(res, 400, { message });
    const refreshToken = req.params.token;
    if (!refreshToken) return void reject("No refresh token provided.");

    await deleteDatabaseEntry(Token, { value: refreshToken }, res);
  })

  // CREATE new access JWT
  .post("/access", async (req: Request, res: Response) => {
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
  });
