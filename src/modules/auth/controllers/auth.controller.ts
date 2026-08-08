import { asyncHandler } from "@/common/utils/async.handler";
import { AuthService } from "../services/auth.service";
import { RegisterUserDto, registerUserSchema } from "../dtos/request/RegisterUser.dto";
import { ApiResponse } from "@/common/response/ApiResponse";
import { LoginUserDto, loginUserSchema } from "../dtos/request/LoginUser.dto";
import { ValidateBody } from "@/common/middlewares/validate.schema";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  @ValidateBody(registerUserSchema)
  register = asyncHandler<RegisterUserDto>(async (req, res) => {
    const response = await this.authService.register(req.body);
    return new ApiResponse({
      status: 201,
      message: "User registered successfully",
      data: response,
    });
  });

  @ValidateBody(loginUserSchema)
  login = asyncHandler<LoginUserDto>(async (req, res) => {
    const response = await this.authService.login(req.body);

    return new ApiResponse({
      status: 200,
      message: "User logged in successfully",
      data: response,
    });
  });
}
