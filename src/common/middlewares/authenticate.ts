import { Request, Response, NextFunction } from "express";
import { JwtService } from "@/common/utils/auth/jwt";
import { ErrorResponse } from "@/common/response/ErrorResponse";
import Container from "@/common/Container";

/**
 * Verifies the Bearer access token and attaches `req.user` to the request.
 *
 * Usage:
 *   router.get("/profile", authenticate, handler)
 */
const tokenService = Container.get(JwtService);
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(
      new ErrorResponse({
        status: 401,
        message: "Authentication required. No token provided.",
      }),
    );
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = { id: payload.id };
    next();
  } catch {
    next(
      new ErrorResponse({
        status: 401,
        message: "Invalid or expired access token.",
      }),
    );
  }
};

/**
 * Decodes (but does NOT verify expiry of) an access token to extract `req.user`.
 *
 * Intended exclusively for the refresh endpoint where the access token may
 * already be expired but we still need the user id to validate the refresh token.
 *
 * Usage:
 *   router.post("/refresh", extractUser, handler)
 */
export const extractUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ErrorResponse({
      status: 401,
      message: "Authentication required. No token provided.",
    });
  }

  const token = authHeader.slice(7);
  const payload = tokenService.decode(token);

  if (!payload?.id) {
    throw new ErrorResponse({
      status: 401,
      message: "Malformed token.",
    });
  }

  req.user = { id: payload.id };
  next();
};
