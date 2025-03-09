import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { MiddlewareFactory } from "@/lib/types";

interface RateLimitRecord {
  lastRequestTime: number;
  requestCount: number;
}

interface RateLimitConfig {
  /** Default: matches all requests */
  matcher?: (request: NextRequest) => boolean | Promise<boolean>;
  /** Default: 100 requests per window */
  maxRequests?: number;
  /** Default: 1-minute window (60000 ms) */
  windowMs?: number;
}

const rateLimitStore: Map<string, RateLimitRecord> = new Map();

export const rateLimitMiddleware: (config?: RateLimitConfig) => MiddlewareFactory =
  ({ matcher = () => true, windowMs = 60000, maxRequests = 100 } = {}) =>
  (next) =>
  async (request, ...args) => {
    const response = next(request, ...args);
    const isMatch = await matcher(request);
    if (!isMatch) {
      return response;
    }
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      "<unknown-ip>";

    const currentTime = Date.now();
    let rateLimitRecord = rateLimitStore.get(clientIp);

    if (rateLimitRecord) {
      const elapsedTime = currentTime - rateLimitRecord.lastRequestTime;

      if (elapsedTime < windowMs) {
        // Increment the request count if within the window
        rateLimitRecord.requestCount++;
      } else {
        // Reset the request count if outside the window
        rateLimitRecord.requestCount = 1;
        rateLimitRecord.lastRequestTime = currentTime;
      }

      rateLimitStore.set(clientIp, rateLimitRecord);
    } else {
      rateLimitRecord = {
        lastRequestTime: currentTime,
        requestCount: 1,
      };
      rateLimitStore.set(clientIp, rateLimitRecord);
    }

    if (rateLimitRecord.requestCount > maxRequests) {
      return NextResponse.json(
        {
          message: "Too many requests, please try again later.",
        },
        {
          status: 429,
        },
      );
    }
    return response;
  };
