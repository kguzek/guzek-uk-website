import { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { authMiddleware } from "./auth";
import { headerMiddleware } from "./headers";
import { loggingMiddleware } from "./logging";
import { STATUS_CODES, logResponse } from "../util";

const code = 429;
const statusMessage = `${code} ${STATUS_CODES[code]}`;

export default function getMiddleware() {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    limit: 100, // 100 requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: code,
    message: (_req: Request, res: Response) => {
      logResponse(res, statusMessage);
      return {
        [statusMessage]: "You have sent too many requests recently. Try again later."
      };
    },
  });

  return [loggingMiddleware, limiter, headerMiddleware, authMiddleware];
}
