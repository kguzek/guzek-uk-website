import { Request, Response } from "express";
import { WhereOptions } from "sequelize";
import { getLogger } from "./middleware/logging";
import { ModelType, DownloadStatus, TorrentInfo } from "./models";
import { Updated } from "./sequelize";

const logger = getLogger(__filename);

const DOWNLOAD_STATUS_MAP = { 4: DownloadStatus.PENDING, 6: DownloadStatus.COMPLETE } as const;

export const STATUS_CODES: { [code: number]: string } = {
  200: "OK",
  201: "Created",
  400: "Bad Request",
  401: "Unauthorised",
  403: "Forbidden",
  404: "Not Found",
  429: "Too Many Requests",
  500: "Internal Server Error",
} as const;

type StatusCode = keyof typeof STATUS_CODES;

const TORRENT_NAME_PATTERN = /^(.+)(?:\.|\s|\+)S0?(\d+)E0?(\d+)/;

/** Updates the 'timestamp' column for the given endpoint in the 'updated' table with the current Epoch time. */
export async function updateEndpoint(endpointClass: ModelType) {
  const newValue = { timestamp: new Date().getTime() };
  const endpoint = endpointClass.tableName;
  const row = await Updated.findOne({ where: { endpoint } });
  if (row) {
    await row.set(newValue).save();
  } else {
    await Updated.create({ endpoint, ...newValue });
  }
  logger.debug(`Updated endpoint '${endpoint}'`);
}

export const logResponse = (res: Response, message: string) =>
  logger.response(message, {
    ip: (res as any).ip,
  });

/** Sends the response with a 200 status and JSON body containing the given data object. */
export function sendOK(
  res: Response,
  data: object | object[] | null,
  code: StatusCode = 200
) {
  logResponse(res, `${code} ${STATUS_CODES[code] ?? STATUS_CODES[200]}`);
  res.status(code).json(data);
}

/** Sends the response with the given code and the provided error object's message property, i.e.
 *
 * `(res, 404, err) => res.status(404).json({ "404 Not Found": err.message })`
 */
export function sendError(
  res: Response,
  code: StatusCode,
  error: { message: string } = { message: "Unknown error." }
) {
  const codeDescription = `${code} ${STATUS_CODES[code] ?? STATUS_CODES[500]}`;
  const jsonRes = { [codeDescription]: error.message };
  logResponse(res, `${codeDescription}: ${error.message}`);
  res.status(code).json(jsonRes);
}

/** Creates a new database entry in the database table model derivative provided.
 *  Sends a response containing the created data, unless `sendMethod` is specified.
 */
export async function createDatabaseEntry(
  model: ModelType,
  req: Request,
  res: Response,
  modelParams?: Record<string, any>,
  sendMethod?: (resp: Response, data: any, code: number) => void
) {
  let obj;
  try {
    obj = await model.create(modelParams ?? req.body);
  } catch (error) {
    if ((error as Error).name === "SequelizeUniqueConstraintError")
      return sendError(res, 400, {
        message: "Cannot create duplicate entries.",
      });
    logger.error("Error while creating database entry: " + error);
    return sendError(res, 500, error as Error);
  }
  await updateEndpoint(model);
  (sendMethod ?? sendOK)(res, obj, 201);
}

/** Retrieves all entries in the database table model derivative provided. */
export async function readAllDatabaseEntries<T extends ModelType>(
  model: T,
  res: Response,
  callback?: (data: InstanceType<T>[]) => void
) {
  let objs;
  try {
    objs = (await model.findAll()) as InstanceType<T>[];
  } catch (error) {
    return void sendError(res, 500, error as Error);
  }
  if (callback) {
    callback(objs);
  } else {
    sendOK(res, objs);
  }
}

/** Retrieves all entries in the database with the provided values and returns the array. */
export async function readDatabaseEntry<T extends ModelType>(
  model: T,
  res: Response,
  where: WhereOptions,
  onError?: (error: Error) => void,
  allowEmptyResults: boolean = false
) {
  let objs;
  try {
    objs = (await model.findAll({ where })) as InstanceType<T>[];
    if (objs.length === 0 && !allowEmptyResults) {
      throw Error("The database query returned no results.");
    }
  } catch (error) {
    return void (onError
      ? onError(error as Error)
      : sendError(res, 500, error as Error));
  }
  return objs;
}

/** Updates the entry with the request payload in the database table model derivative provided.
 *  Sends back a response containing the number of affected rows.
 */
export async function updateDatabaseEntry(
  model: ModelType,
  req: Request,
  res: Response,
  modelParams?: Record<string, any>,
  where?: WhereOptions
) {
  let result: [affectedCount: number];
  where ??= req.params;
  modelParams ??= req.body;
  if (!modelParams)
    return void sendError(res, 400, {
      message: "Model parameters must be specified in request body.",
    });
  try {
    result = await model.update(modelParams, { where });
  } catch (error) {
    return void sendError(res, 500, error as Error);
  }
  const affectedRows = result[0];
  await updateEndpoint(model);
  return sendOK(res, { affectedRows });
}

/** Deletes the specified entry from the database table model derivative provided.
 *  Sends back a response containing the number of destroyed rows.
 */
export async function deleteDatabaseEntry(
  model: ModelType,
  where: WhereOptions,
  res?: Response
) {
  let destroyedRows: number;
  try {
    destroyedRows = await model.destroy({ where });
  } catch (error) {
    if (!res) throw error;
    return void sendError(res, 500, error as Error);
  }
  await updateEndpoint(model);
  if (res) {
    sendOK(res, { destroyedRows });
  } else {
    return destroyedRows;
  }
}

export const isInvalidDate = (date: Date) => date.toString() === "Invalid Date";

/** Sets the Cache-Control header in the response so that browsers will be able to cache it for a maximum of `maxAgeMinutes` minutes. */
export const setCacheControl = (res: Response, maxAgeMinutes: number) =>
  res.set("Cache-Control", `public, max-age=${maxAgeMinutes * 60}`);

function getStatus(status: number) {
  const val = DOWNLOAD_STATUS_MAP[status as keyof typeof DOWNLOAD_STATUS_MAP];
  if (val != null) return val;
  logger.warn(`Unknown torrent status code '${status}'.`);
  return DownloadStatus.FAILED;
}

/** Converts the data into the form useful to the client application. */
export function convertTorrentInfo(info: TorrentInfo) {
  if (!info.name) throw new Error("Torrent info has no name attribute");
  const match = info.name.match(TORRENT_NAME_PATTERN);
  if (!match) throw new Error(`Torrent name doesn't match regex: '${info.name}'.`)
  const [_, showName, season, episode] = match;
  return {
    status: getStatus(info.status),
    showName: showName.replace(/\./g, " "),
    season: +season,
    episode: +episode,
    progress: info.percentDone,
    speed: info.rateDownload,
    eta: info.eta,
  };
}
