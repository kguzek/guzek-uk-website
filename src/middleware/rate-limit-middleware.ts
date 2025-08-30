import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { MiddlewareFactory } from "@/lib/types";
import { IP_BLACKLIST } from "@/lib/constants";
import { getRequestIp } from "@/lib/util";

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

export const rateLimitMiddleware: <T extends Array<unknown> = Array<never>>(
  config?: RateLimitConfig,
) => MiddlewareFactory<T> = ({
  matcher = () => true,
  windowMs = 60000,
  maxRequests = 100,
} = {}) => {
  const rateLimitStore = new Map<string, RateLimitRecord>();
  return (next) =>
    async (request, ...args) => {
      const response = next(request, ...args);
      const isMatch = await matcher(request);
      if (!isMatch) {
        return response;
      }
      const clientIp = getRequestIp(request);

      if (IP_BLACKLIST.includes(clientIp)) {
        console.warn("Blocked blacklisted IP", clientIp);
        return NextResponse.json(
          {
            message: "You are not allowed to access this resource.",
          },
          {
            status: 403,
          },
        );
      }

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
      } else {
        rateLimitRecord = {
          lastRequestTime: currentTime,
          requestCount: 1,
        };
        rateLimitStore.set(clientIp, rateLimitRecord);
      }

      if (rateLimitRecord.requestCount > maxRequests) {
        console.log(
          `Rate limit exceeded by ${clientIp} at ${request.method} ${request.nextUrl.pathname} (${rateLimitRecord.requestCount}/${maxRequests} requests)`,
        );
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
};
