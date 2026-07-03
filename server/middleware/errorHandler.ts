import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse";

export class AppError extends Error {
  public statusCode: number;
  public metadata: Record<string, any>;

  constructor(message: string, statusCode = 500, metadata: Record<string, any> = {}) {
    super(message);
    this.statusCode = statusCode;
    this.metadata = metadata;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const metadata = err.metadata || {};

  // Log error details securely
  console.error(`[ERROR] [${req.method}] ${req.path} - Status: ${statusCode} - Message: ${message}`, err.stack);

  res.status(statusCode).json(sendError(message, {
    path: req.path,
    ...metadata,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  }));
}
