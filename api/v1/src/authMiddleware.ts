import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getLogger } from "./logger";
import { sendError, UserObj } from "./util";

const logger = getLogger(__filename);

export function getTokenSecret(type: string) {
  const secret = process.env[`JWT_${type.toUpperCase()}_TOKEN_SECRET`];
  return (secret ?? "") as jwt.Secret;
}

const ENDPOINTS: { [level: string]: { [method: string]: string[] } } = {
  anonymous: {
    GET: ["/pages"],
    POST: ["/auth/login", "/auth/create-account"],
  },
  loggedInUser: {
    POST: ["/auth/token"],
    DELETE: ["/auth/logout"],
  },
};

export default function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const endpointAccessibleBy: { [level: string]: boolean } = {
    anonymous: false,
    loggedInUser: false,
  };
  for (const level of ["anonymous", "loggedInUser"]) {
    const endpoints = ENDPOINTS[level]?.[req.method] ?? [];
    if (endpoints.some((endpoint) => req.path.startsWith(endpoint))) {
      endpointAccessibleBy[level] = true;
    }
  }

  function reject(code: number, message: string) {
    if (endpointAccessibleBy.anonymous) {
      return void next();
    }
    sendError(res, code, { message });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")?.[1];
  if (!token) {
    return reject(401, "Missing authorisation token.");
  }

  jwt.verify(token, getTokenSecret("access"), (err, user) => {
    if (err) {
      logger.error(err);
      return reject(403, "Invalid authorisation token.");
    }
    req.user = user as UserObj;
    if (
      endpointAccessibleBy.anonymous ||
      endpointAccessibleBy.loggedInUser ||
      req.user?.admin
    ) {
      return void next();
    }
    // Allow user to edit own details
    if (req.path.startsWith("/auth/user/" + req.user?.uuid)) {
      if (["GET", "PUT"].includes(req.method)) {
        return void next();
      }
    }
    reject(403, "You cannot perform that action.");
  });
}
