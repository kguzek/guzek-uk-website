import express, { Request, Response } from "express";
import { getLogger } from "../src/logger";
import { Page, PageContent } from "../src/sequelize";
import {
  createDatabaseEntry,
  deleteDatabaseEntry,
  readAllDatabaseEntries,
  sendError,
  updateDatabaseEntry,
} from "../src/util";

export const router = express.Router();

enum CONTENT_LANGUAGES {
  EN = "contentEN",
  PL = "contentPL",
}

const send404 = (req: Request, res: Response) =>
  void sendError(res, 404, {
    message: `Could not find page with ID '${req.params.id}'.`,
  });

function validateLangParameter(req: Request, res: Response) {
  const reject = (message: string) => void sendError(res, 400, { message });
  if (!req.query.lang) {
    return reject("No content language specified in request query.");
  }
  if (!(req.query.lang.toString() in CONTENT_LANGUAGES)) {
    return reject(`Invalid content language: '${req.query.lang}'.`);
  }
  return req.query.lang as keyof typeof CONTENT_LANGUAGES;
}

/** Consumes the request body, checking if the page content has been edited.
 *  If so, makes the appropriate changes in the `page` and `page_content` databases,
 *  and sends the response to the user.
 */
async function modifyPageContent(
  req: Request,
  res: Response,
  updateExistingPage: boolean
) {
  const { content, ...attributes } = req.body;
  let pageID = req.params.id;
  if (updateExistingPage) {
    await updateDatabaseEntry(Page, req, res, attributes);
  } else {
    await createDatabaseEntry(Page, req, res, attributes);
    console.log(pageID);
  }

  if (content) {
    // Request validation
    const lang = validateLangParameter(req, res);
    if (!lang) return;
    const newValues = { [CONTENT_LANGUAGES[lang]]: content };
    // Determine if the entry has to be created or modified
    try {
      await PageContent.update(newValues, { where: { pageID } });
    } catch {
      await PageContent.create(newValues);
    }
  }
}

router
  // CREATE new page
  .post("/", (req: Request, res: Response) => {
    return modifyPageContent(req, res, false);
  })

  // READ all pages
  .get("/", (_req: Request, res: Response) => {
    return readAllDatabaseEntries(Page, res);
  })

  // UPDATE single page
  .put("/:id", (req: Request, res: Response) => {
    return modifyPageContent(req, res, true);
  })

  // DELETE single page
  .delete("/:id", (req: Request, res: Response) => {
    return deleteDatabaseEntry(Page, { id: req.params.id }, res);
  });
