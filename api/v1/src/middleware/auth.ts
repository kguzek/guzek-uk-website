import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getLogger } from "./logging";
import { sendError, UserObj } from "../util";

const logger = getLogger(__filename);

// Allows all requests to go through, even if JWT authentication fails.
const DISABLE_AUTH = process.env.NODE_ENV === "development" && 1;

export function getTokenSecret(type: string) {
  const secret = process.env[`JWT_${type.toUpperCase()}_TOKEN_SECRET`];
  return (secret ?? "") as jwt.Secret;
}

const ENDPOINTS: { [level: string]: { [method: string]: string[] } } = {
  anonymous: {
    GET: [
      "/pages",
      "/updated",
      "/cocodentax-admin/allegro/auth",
      "/cocodentax-admin/allegro/api",
    ],
    POST: [
      "/auth/user",
      "/auth/users",
      "/cocodentax-admin/pocztex/validate-orders",
      "/cocodentax-admin/pocztex/process-orders",
    ],
  },
  loggedInUser: {
    POST: ["/auth/token"],
    DELETE: ["/auth/token"],
  },
};

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const endpointAccessibleBy: { [level: string]: boolean } = {
    anonymous: false,
    loggedInUser: false,
  };
  for (const [level, routes] of Object.entries(ENDPOINTS)) {
    const endpoints = routes[req.method] ?? [];
    endpointAccessibleBy[level] = endpoints.some((e) => req.path.startsWith(e));
  }

  function reject(code: number, message: string) {
    if (endpointAccessibleBy.anonymous || DISABLE_AUTH) {
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
      return reject(401, "Invalid authorisation token.");
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
