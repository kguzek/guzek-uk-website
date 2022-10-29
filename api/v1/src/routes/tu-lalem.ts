import express from "express";
import { Op } from "sequelize";
import { TuLalem } from "../sequelize";
import {
  createDatabaseEntry,
  readAllDatabaseEntries,
  readDatabaseEntry,
  sendOK,
} from "../util";
export const router = express.Router();

router
  .post("/", (req, res) => {
    createDatabaseEntry(TuLalem, req, res);
  })

  .get("/", async (req, res) => {
    const user = req.query.user;
    if (!user) {
      return readAllDatabaseEntries(TuLalem, res);
    }

    const timespan = req.query.timespan ?? "10"; // minutes
    const fromTimestamp = new Date().getTime() - +timespan * 60_000;

    const entries = await readDatabaseEntry(TuLalem, res, {
      userUUID: user,
      timestamp: { [Op.gte]: fromTimestamp },
    });
    if (entries) sendOK(res, entries);
  });
