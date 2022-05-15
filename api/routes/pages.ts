import express, { Request, Response } from "express";
const router = express.Router();
import {
  appendToDatabase,
  readFromDatabase,
  replaceDatabase,
  modifyInDatabase,
  deleteFromDatabase,
} from "../src/util";

router
  // CREATE new page
  .post("/", (req: Request, res: Response) =>
    appendToDatabase(res, "pages", req.body)
  )

  // READ all pages
  .get("/", (_req: Request, res: Response) => readFromDatabase(res, "pages"))

  // UPDATE all pages
  .put("/", (req: Request, res: Response) =>
    replaceDatabase(res, "pages", req.body)
  )

  // UPDATE single page
  .put("/:index", (req: Request, res: Response) =>
    modifyInDatabase(res, "pages", req.params.index, req.body)
  )

  // DELETE single page
  .delete("/:index", (req: Request, res: Response) =>
    deleteFromDatabase(res, "pages", req.params.index)
  );

module.exports = router;
