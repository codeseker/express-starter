import { asyncHandler } from "@/common/utils/async.handler";
import { AuthService } from "../services/auth.service";
import { RegisterUserDto } from "../dtos/request/RegisterUser.dto";
import { ApiResponse } from "@/common/response/ApiResponse";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler<RegisterUserDto>(async (req, res) => {
    const response = await this.authService.register(req.body);
    return new ApiResponse({
      status: 201,
      message: "User registered successfully",
      data: response,
    });
  });
}
