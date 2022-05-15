import express, { Request, Response } from "express";
import { Page } from "../src/sequelize";
import {
  createDatabaseEntry,
  deleteDatabaseEntry,
  readAllDatabaseEntries,
  updateDatabaseEntry,
} from "../src/util";

export const router = express.Router();

router
  // CREATE new page
  .post("/", async (req: Request, res: Response) => {
    await createDatabaseEntry(Page, req, res);
  })

  // READ all pages
  .get("/", async (_req: Request, res: Response) => {
    await readAllDatabaseEntries(Page, res);
  })

  // UPDATE single page
  .put("/:id", async (req: Request, res: Response) => {
    await updateDatabaseEntry(Page, req, res);
  })

  // DELETE single page
  .delete("/:id", async (req: Request, res: Response) => {
    await deleteDatabaseEntry(Page, req, res);
  });
