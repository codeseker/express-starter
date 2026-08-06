import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { ApiResponse } from "../response/ApiResponse";

/**
 * Strongly typed route params.
 *
 * Express path params are always strings, so this alias avoids depending on
 * an Express internal type that may change across versions.
 */
export type RouteParams = Record<string, string>;

/**
 * A controller callback that always returns ApiResponse<T>.
 *
 * This type ensures the request and response objects are fully typed
 * without requiring explicit `Request` or `Response` annotations in handlers.
 */
export type AsyncController<
  ReqBody = unknown,
  ResBody = unknown,
  ReqQuery = unknown,
  ReqParams extends RouteParams = RouteParams,
> = (
  req: Request<ReqParams, ApiResponse<ResBody>, ReqBody, ReqQuery>,
  res: Response<ApiResponse<ResBody>>,
) => Promise<ApiResponse<ResBody>> | ApiResponse<ResBody>;

/**
 * Wrap an async controller and preserve strong request/response typing.
 *
 * Example:
 * const getUsers = asyncHandler<
 *   { page?: number },
 *   UserDto[],
 *   { search?: string },
 *   { organizationId: string }
 * >(async (req, res) => {
 *   req.body; // typed
 *   req.query; // typed
 *   req.params; // typed
 *   return new ApiResponse<UserDto[]>({
 *     status: 200,
 *     message: "Fetched users",
 *     data: users,
 *   });
 * });
 */
export const asyncHandler = <
  ReqBody = unknown,
  ResBody = unknown,
  ReqQuery = unknown,
  ReqParams extends RouteParams = RouteParams,
>(
  controller: AsyncController<ReqBody, ResBody, ReqQuery, ReqParams>,
): RequestHandler<ReqParams, ApiResponse<ResBody>, ReqBody, ReqQuery> => {
  return async (req, res, next: NextFunction) => {
    try {
      const result = await controller(req, res);

      if (res.headersSent) return;

      return res.status(result.status).json(result);
    } catch (err) {
      next(err);
    }
  };
};
