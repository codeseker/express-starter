import { Request, Response, NextFunction } from "express";
import { UserRepository } from "@/modules/auth/repository/auth.repository";
import { ErrorResponse } from "@/common/response/ErrorResponse";

const userRepository = new UserRepository();

export const requireVerified = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user) {
    return next(
      new ErrorResponse({
        status: 401,
        message: "Authentication required.",
      }),
    );
  }

  const user = await userRepository.findById(req.user.id);

  if (!user) {
    return next(
      new ErrorResponse({
        status: 404,
        message: "User not found.",
      }),
    );
  }

  if (!user.isVerified) {
    return next(
      new ErrorResponse({
        status: 403,
        message:
          "Email verification required. Please verify your email to access this resource.",
      }),
    );
  }

  next();
};
