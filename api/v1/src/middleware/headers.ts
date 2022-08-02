import { NextFunction, Request, Response } from "express";

export function headerMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const now = new Date().getTime();
  res.setHeader("Timestamp", now);
  next();
}
