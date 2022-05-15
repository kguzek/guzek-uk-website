import { Response } from "express";

import fs from "fs";
import { getLogger } from "./logger";

const DATABASE_DIRECTORY = "database/";
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
function sendOK(res: Response, data: object | object[]) {
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
  const codeDescription = `${code} ${STATUS_CODES[code] || STATUS_CODES[500]}`;
  const jsonRes = { [codeDescription]: error.message };
  logger.response(`${codeDescription}: ${error.message}`);
  res.status(code).json(jsonRes);
}

/** Reads the given file and calls the callback if it was parsed as JSON successfully.
 * Otherwise, sends the appropriate HTTP 404 or 500 response.
 */
function _readFile(filename: string, res: Response, callback: Function) {
  fs.readFile(`${DATABASE_DIRECTORY}${filename}.json`, (fileErr, data) => {
    if (fileErr) {
      // The file could not be read
      return void sendError(res, 404, fileErr);
    }
    try {
      // Return the file contents as JSON
      var parsed = JSON.parse(data as unknown as string);
    } catch (parseErr) {
      // The file contents could not be parsed as JSON
      return void sendError(res, 500, parseErr as Error);
    }
    callback(parsed);
  });
}

/** Encodes the raw object as an unsigned integer array and writes it to the destination. */
function _writeFile(
  filename: string,
  dataObj: object,
  res: Response,
  callback: Function
) {
  const dataString = JSON.stringify(dataObj, undefined, 4);
  const data = new Uint8Array(Buffer.from(dataString));
  fs.writeFile(`${DATABASE_DIRECTORY}${filename}.json`, data, (err) => {
    if (err) {
      return sendError(res, 500, err);
    } else {
      callback();
    }
  });
}

/** Checks if the input object contains any keys.
 * If so, returns true.
 * Otherwise, sends a 400 response and returns false.
 */
function _parseObjectInput(res: Response, input: object) {
  if (Object.keys(input).length > 0) {
    return true;
  }
  sendError(res, 400, {
    message:
      "Invalid request body. Must be an object containing at least one field to update.",
  });
  return false;
}

/** Checks if the input is an array.
 * If so, returns true.
 * Otherwise, sends a 400 response and returns false.
 */
function _parseArrayInput(res: Response, input: object[]) {
  if (Array.isArray(input)) {
    return true;
  }
  sendError(res, 400, {
    message: `Invalid request body. Must be an array containing data. `,
  });
  return false;
}

/** Checks if the input string can be parsed as an integer.
 * If so, returns the parsed integer.
 * Otherwise, sends a 400 response and returns null. */
function _parseIntegerInput(res: Response, input: string) {
  const parsed = parseInt(input);
  if (!isNaN(parsed)) {
    return parsed;
  }
  sendError(res, 400, {
    message: `Invalid input '${input}'.`,
  });
  return null;
}

/** Appends a JS object to an array within a JSON file. */
export function appendToDatabase(
  res: Response,
  filename: string,
  newData = {}
) {
  // Check if the object contains any keys
  if (!_parseObjectInput(res, newData)) {
    // It is an empty object; error response has been sent
    return;
  }
  // Retrieve the old data
  _readFile(filename, res, (data: object[]) => {
    // Append the new object to the array of existing objects
    const updatedData = [...data, newData];
    // Replace the entire file with the merged data
    _writeFile(filename, updatedData, res, () => {
      // Send the merged data as JSON
      sendOK(res, updatedData);
    });
  });
}

/** Replaces the entire JSON file with the given data. */
export function replaceDatabase(res: Response, filename: string, newData = []) {
  if (!_parseArrayInput(res, newData)) {
    return;
  }
  _writeFile(filename, newData, res, () => sendOK(res, newData));
}

/** Replaces the entry with the given index in the array within a JSON file. */
export function modifyInDatabase(
  res: Response,
  filename: string,
  indexStr: string,
  newData = {}
) {
  // Check if the input string index could not be parsed or if the data has no keys
  const index = _parseIntegerInput(res, indexStr);
  if (index === null || !_parseObjectInput(res, newData)) {
    return;
  }
  // Read the document and replace the entry object
  _readFile(filename, res, (data: object[]) => {
    if (data.length < index + 1) {
      sendError(res, 400, {
        message: `The data only contains ${
          data.length
        } items. Cannot modify element ${index + 1}.`,
      });
    } else {
      data[index] = newData;
      _writeFile(filename, data, res, () => sendOK(res, data));
    }
  });
}

/** Sends the entire contents of a JSON file. */
export function readFromDatabase(res: Response, filename: string) {
  // Read the entire document and send its contents
  _readFile(filename, res, (data: object) => sendOK(res, data));
}

/** Removes an item with the given index from the array within a JSON file. */
export function deleteFromDatabase(
  res: Response,
  filename: string,
  indexStr: string
) {
  // Check if the input string index could not be parsed
  const index = _parseIntegerInput(res, indexStr);
  if (index === null) {
    return;
  }
  // Read the file and remove the item at the specified index
  _readFile(filename, res, (data: object[]) => {
    data.splice(index, 1);
    // Write the spliced array
    _writeFile(filename, data, res, () =>
      sendOK(res, { success: `Item with index ${index} was deleted.` })
    );
  });
}
