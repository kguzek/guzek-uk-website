import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getLogger } from "./logging";
import { sendError } from "../util";
import { RequestMethod, UserObj } from "../models";

const logger = getLogger(__filename);

// Allows all requests to go through, even if JWT authentication fails.
const DISABLE_AUTH = process.env.NODE_ENV === "development" && false;

// TODO: Server-side token expiry vaildation

export function getTokenSecret(type: "access" | "refresh") {
  const secret = process.env[`JWT_${type.toUpperCase()}_TOKEN_SECRET`];
  return (secret ?? "") as jwt.Secret;
}

const ENDPOINTS = {
  anonymous: {
    GET: [
      "/pages", // View all pages
      "/updated", // View site updates
      "/cocodentax-admin/allegro/auth", // Login to Allegro
      "/cocodentax-admin/allegro/api", // Make Allegro API requests
    ],
    POST: [
      "/auth/user", // Log in
      "/auth/users", // Sign up
      "/auth/token", // Regenerate token
      "/cocodentax-admin/pocztex/orders", // Submit Pocztex order
    ],
    PUT: [],
    DELETE: [],
    PATCH: [],
  },
  loggedInUser: {
    GET: [
      "/tu-lalem", // View all app coordinates
      "/auth/usernames", // View all usernames
      "/liveseries/liked-shows/personal", // View own liked shows
      "/liveseries/watched-episodes/personal", // View own watched episodes
    ],
    POST: [
      "/tu-lalem", // Submit app coordinates
      "/liveseries/liked-shows/personal", // Add show to liked list
    ],
    PUT: [],
    DELETE: [
      "/auth/token", // Log out
      "/liveseries/liked-shows/personal", // Remove show from liked list
    ],
    PATCH: ["/liveseries/watched-episodes/personal"], // Modify own watched episodes
  },
} as const;

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const endpointAccessibleBy = {
    anonymous: false,
    loggedInUser: false,
  };
  // Check if the current endpoint is accessible using the request method to anonymous or logged in users
  for (const [level, routes] of Object.entries(ENDPOINTS)) {
    const endpoints = routes[req.method as RequestMethod] ?? [];
    endpointAccessibleBy[level as keyof typeof ENDPOINTS] = endpoints.some(
      (endpoint) => req.path.startsWith(endpoint)
    );
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
    // console.log(req.user);
    if (endpointAccessibleBy.loggedInUser || req.user?.admin) {
      return void next();
    }
    // Allow user to edit own details
    if (req.path.startsWith("/auth/user/" + req.user?.uuid)) {
      if (["GET", "PUT", "PATCH"].includes(req.method)) {
        return void next();
      }
    }
    reject(403, "You cannot perform that action.");
  });
}
