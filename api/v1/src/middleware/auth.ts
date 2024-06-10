import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getLogger } from "./logging";
import { sendError } from "../util";
import { RequestMethod, UserObj } from "../models";

const logger = getLogger(__filename);

// Allows all requests to go through, even if JWT authentication fails.
const DISABLE_AUTH = process.env.NODE_ENV === "development" && false;

// If false, allows requests with expired access tokens to go through
const VERIFY_TOKEN_EXPIRY = true;

export function getTokenSecret(type: "access" | "refresh") {
  const secret = process.env[`JWT_${type.toUpperCase()}_TOKEN_SECRET`];
  return (secret ?? "") as jwt.Secret;
}

const PERMISSIONS = {
  anonymous: {
    GET: [
      "/pages", // View all pages
      "/updated", // View site updates
      "/cocodentax-admin/allegro/auth", // Login to Allegro
      "/cocodentax-admin/allegro/api", // Make Allegro API requests
      "/liveseries/downloaded-episodes/ws/.websocket", // LiveSeries downloaded episode info
    ],
    POST: [
      "/auth/users", // Sign up
      "/auth/tokens", // Log in
      "/auth/access", // Regenerate access token
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
    PUT: ["/liveseries/watched-episodes/personal"], // Modify own watched episodes
    DELETE: [
      "/auth/tokens", // Log out
      "/liveseries/liked-shows/personal", // Remove show from liked list
    ],
    PATCH: [],
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
  for (const [level, routes] of Object.entries(PERMISSIONS)) {
    const endpoints = routes[req.method as RequestMethod] ?? [];
    endpointAccessibleBy[level as keyof typeof PERMISSIONS] = endpoints.some(
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
    const { iat, exp, ...userDetails } = user as UserObj & {
      iat: number;
      exp: number;
    };
    req.user = userDetails;
    if (VERIFY_TOKEN_EXPIRY && new Date().getTime() > exp) {
      return reject(401, "Access token is expired.");
    }
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
