import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiResponse } from "../response/ApiResponse";

type ControllerFn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any> | any;

export const asyncHandler = (fn: ControllerFn): RequestHandler => {
  return async (req, res, next) => {
    try {
      const result = await fn(req, res, next);

      // If the handler already sent a response manually, don't double-send
      if (res.headersSent) return;

      if (result instanceof ApiResponse) {
        return res.status(result.status).json(result);
      }

      if (result !== undefined) {
        return res.status(200).json(result);
      }
    } catch (err) {
      next(err);
    }
  };
};
