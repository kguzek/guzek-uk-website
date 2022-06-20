import express, { Request, Response } from "express";
import { User } from "../src/sequelize";
import {
  createDatabaseEntry,
  readDatabaseEntry,
  sendError,
  sendOK,
} from "../src/util";

const password = require("s-salt-pepper");

export const router = express.Router();

router
  // CREATE new account
  .post("/create-account", async (req: Request, res: Response) => {
    const { password: pw, ...body } = req.body;

    if (!pw || !body.email) {
      return sendError(res, 400, { message: "Invalid account details." });
    }

    const results = await readDatabaseEntry(
      User,
      res,
      { email: body.email },
      () => {}
    );

    if (results?.shift()) {
      return sendError(res, 400, {
        message: "A user with that email address already exists.",
      });
    }

    const credentials = await password.hash(pw);

    const user = {
      ...body,
      ...credentials,
    };

    await createDatabaseEntry(
      User,
      req,
      res,
      user,
      (_res: Response, record: User) => {
        const { hash, salt, id, ...data } = record.get();
        sendOK(res, data);
      }
    );
  })

  // POST login details
  .post("/login", async (req: Request, res: Response) => {
    function reject(message: string) {
      sendError(res, 400, { message });
    }

    const { password: pw, email } = req.body;

    if (!email || !pw) return reject("Credentials not provided.");

    const records = await readDatabaseEntry(User, res, { email });
    if (!records) return;
    const userRecord = records.shift() as User;
    const { hash, salt, ...userDetails } = userRecord.get();
    const isValid = await password.compare(pw, { hash, salt });
    if (!isValid) return reject("Invalid credentials.");
    return res.status(200).json(userDetails);
  });
