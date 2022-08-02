import { NextFunction, Request, Response } from "express";

// const HEADERS = [
//   "A-IM",
//   "Accept",
//   "Accept-Charset",
//   "Accept-Encoding",
//   "Accept-Language",
//   "Accept-Datetime",
//   "Access-Control-Request-Method",
//   "Access-Control-Request-Headers",
//   "Authorization",
//   "Cache-Control",
//   "Connection",
//   "Content-Length",
//   "Content-Type",
//   "Cookie",
//   "Date",
//   "Expect",
//   "Forwarded",
//   "From",
//   "Host",
//   "If-Match",
//   "If-Modified-Since",
//   "If-None-Match",
//   "If-Range",
//   "If-Unmodified-Since",
//   "Max-Forwards",
//   "Origin",
//   "Pragma",
//   "Proxy-Authorization",
//   "Range",
//   "Referer",
//   "TE",
//   "User-Agent",
//   "Upgrade",
//   "Via",
//   "Warning",
// ];

export function headerMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const now = new Date().getTime();
  // "Pragma" is one of the four HTTP headers stored when caching a response using the
  // JavaScript Cache API. The others are Cache-Control, Content-Length, and Content-Type.
  // Pragma's behaviour is implementation-specific, and serves no real purpose since HTTP 1.1,
  // so I decided to use it to store when the response was generated. This way I can check this
  // information on the client side using the cached header.
  res.setHeader("pragma", now);
  next();
}
