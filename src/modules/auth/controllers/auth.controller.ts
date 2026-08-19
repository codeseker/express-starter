import { asyncHandler } from "@/common/utils/async.handler";
import { AuthService } from "../services/auth.service";
import {
  RegisterUserDto,
  registerUserSchema,
} from "../dtos/request/RegisterUser.dto";
import { ApiResponse } from "@/common/response/ApiResponse";
import { LoginUserDto, loginUserSchema } from "../dtos/request/LoginUser.dto";
import {
  VerifyEmailDto,
  verifyEmailSchema,
} from "../dtos/request/VerifyEmail.dto";
import { ValidateBody } from "@/common/middlewares/validate.schema";
import {
  RefreshTokenDto,
  refreshTokenSchema,
} from "../dtos/request/RefreshToken.dto";
import { Component } from "@/common/Component";

@Component
export class AuthController {
  constructor(private authService: AuthService) {}

  @ValidateBody(registerUserSchema)
  register = asyncHandler<RegisterUserDto>(async (req) => {
    const response = await this.authService.register(req.body);
    return new ApiResponse({
      status: 201,
      message:
        "Registration successful. A verification code has been sent to your email.",
      data: response,
    });
  });

  @ValidateBody(loginUserSchema)
  login = asyncHandler<LoginUserDto>(async (req) => {
    const response = await this.authService.login(req.body);
    return new ApiResponse({
      status: 200,
      message: "Logged in successfully.",
      data: response,
    });
  });

  @ValidateBody(refreshTokenSchema)
  refresh = asyncHandler<RefreshTokenDto>(async (req) => {
    const { refreshToken } = req.body;

    const response = await this.authService.refresh(req.user!.id, refreshToken);

    return new ApiResponse({
      status: 200,
      message: "Token refreshed successfully.",
      data: response,
    });
  });

  logout = asyncHandler(async (req) => {
    await this.authService.logout(req.user!.id.toString());

    return new ApiResponse({
      status: 200,
      message: "Logged out successfully.",
    });
  });

  @ValidateBody(verifyEmailSchema)
  verifyEmail = asyncHandler<VerifyEmailDto>(async (req) => {
    await this.authService.verifyEmail(req.user!.id, req.body.code);

    return new ApiResponse({
      status: 200,
      message: "Email verified successfully.",
    });
  });

  resendOtp = asyncHandler(async (req) => {
    await this.authService.resendVerificationOtp(req.user!.id);

    return new ApiResponse({
      status: 200,
      message: "A new verification code has been sent to your email.",
    });
  });
}
