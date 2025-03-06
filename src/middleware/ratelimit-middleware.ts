import { NextResponse } from "next/server";

import type { MiddlewareFactory } from "@/lib/types";

const rateLimitMap = new Map<string | null, { count: number; lastReset: number }>();

export const rateLimitMiddleware: MiddlewareFactory =
  (handler) =>
  (req, ...args) => {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip");
    const limit = 5; // Limiting requests to 5 per minute per IP
    const windowMs = 60 * 1000; // 1 minute

    let ipData = rateLimitMap.get(ip);
    if (ipData == null) {
      ipData = {
        count: 0,
        lastReset: Date.now(),
      };
      rateLimitMap.set(ip, ipData);
    } else if (Date.now() - ipData.lastReset > windowMs) {
      ipData.count = 0;
      ipData.lastReset = Date.now();
    }

    if (ipData.count >= limit) {
      return NextResponse.json("Too many requests", { status: 429 });
    }

    ipData.count += 1;
    return handler(req, ...args);
  };
