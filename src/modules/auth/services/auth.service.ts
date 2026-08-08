import { ROLES } from "@/common/database/seeder/types/roles.types";
import { RegisterUserDto } from "../dtos/request/RegisterUser.dto";
import { UserRepository } from "../repository/auth.repository";
import { RoleRepository } from "../repository/role.repository";
import { ErrorResponse } from "@/common/response/ErrorResponse";
import { JwtService } from "@/common/utils/auth/jwt";
import { BcryptService } from "@/common/utils/auth/bcrypt";
import { LoginUserDto } from "../dtos/request/LoginUser.dto";

export class AuthService {
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
  }

  async register(userDto: RegisterUserDto) {
    const role = await this.roleRepository.findOne({
      name: ROLES.USER.name,
    });

    if (!role) {
      throw new ErrorResponse({
        status: 500,
        message: "Default user role not found.",
      });
    }

    const exists = await this.userRepository.exists({
      email: userDto.email,
    });

    if (exists) {
      throw new ErrorResponse({
        status: 409,
        message: "User with this email already exists.",
      });
    }
    const hashedPassword = await BcryptService.hash(userDto.password);

    const payload = {
      email: userDto.email,
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      roleId: role._id,
      password: hashedPassword,
    };

    const user = await this.userRepository.create(payload);

    const tokens = JwtService.generateTokenPair({ id: user._id });

    await this.userRepository.updateById(user._id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: ROLES.USER.name,
      },
      tokens,
    };
  }

  async login(userDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      email: userDto.email,
    });

    if (!user) {
      throw new ErrorResponse({
        status: 404,
        message: "User with this email not found.",
      });
    }

    const isMatch = await BcryptService.compare(
      userDto.password,
      user.password!,
    );

    if (!isMatch) {
      throw new ErrorResponse({
        status: 401,
        message: "Invalid email or password",
      });
    }

    const tokens = JwtService.generateTokenPair({ id: user._id });

    await this.userRepository.updateById(user._id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: ROLES.USER.name,
      },
      tokens,
    };
  }
}
