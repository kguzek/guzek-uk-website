import { Request, Response } from "express";
import { Model } from "sequelize/types";
import { getLogger } from "./logger";
import { Page } from "./sequelize";

const logger = getLogger(__filename);

interface StatusCodeMap {
  [code: number]: string;
}

const STATUS_CODES: StatusCodeMap = {
  400: "Bad Request",
  404: "Not Found",
  500: "Internal Server Error",
};

interface ServerError {
  name?: string;
  message: string;
}

/** Sends the response with a 200 status and JSON body containing the given data object. */
export function sendOK(res: Response, data: object | object[]) {
  logger.response("200 OK");
  res.status(200).json(data);
}

/** Sends the response with the given code and the provided error object's message property, i.e.
 *
 * `(res, 404, err) => res.status(404).json({ "404 Not Found": err.message })`
 */
export function sendError(
  res: Response,
  code: number,
  error: ServerError = { message: "Unknown error." }
) {
  const codeDescription = `${code} ${STATUS_CODES[code] ?? STATUS_CODES[500]}`;
  const jsonRes = { [codeDescription]: error.message };
  logger.response(`${codeDescription}: ${error.message}`);
  res.status(code).json(jsonRes);
}

/** Creates a new database entry in the database table model derivative provided. */
export async function createDatabaseEntry(
  model: typeof Page,
  req: Request,
  res: Response
) {
  let obj;
  try {
    obj = await model.create(req.body);
  } catch (error) {
    return void sendError(res, 400, error as Error);
  }

  sendOK(res, obj);
}

/** Retrieves all entries in the database table model derivative provided. */
export async function readAllDatabaseEntries(
  model: typeof Page,
  res: Response
) {
  let objs;
  try {
    objs = await model.findAll();
  } catch (error) {
    return void sendError(res, 500, error as Error);
  }
  sendOK(res, objs);
}

/** Updates the entry with the request payload in the database table model derivative provided. */
export async function updateDatabaseEntry(
  model: typeof Page,
  req: Request,
  res: Response
) {
  let result: number[];
  try {
    result = await model.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
  } catch (error) {
    return void sendError(res, 400, error as Error);
  }
  sendOK(res, { affectedRows: result.shift() });
}

/** Deletes the specified entry from the database table model derivative provided. */
export async function deleteDatabaseEntry(
  model: typeof Page,
  req: Request,
  res: Response
) {
  let destroyedRows: number;
  try {
    destroyedRows = await model.destroy({
      where: {
        id: req.params.id,
      },
    });
  } catch (error) {
    return void sendError(res, 400, error as Error);
  }
  sendOK(res, { destroyedRows });
}
