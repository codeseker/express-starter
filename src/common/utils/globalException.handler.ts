import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../response/ErrorResponse";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ErrorResponse) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      errors: err.errors ?? null,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
