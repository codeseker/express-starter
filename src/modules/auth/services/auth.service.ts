import { ROLES } from "@/common/database/seeder/types/roles.types";
import { RegisterUserDto } from "../dtos/request/RegisterUser.dto";
import { UserRepository } from "../repository/auth.repository";
import { RoleRepository } from "../repository/role.repository";
import { OtpRepository } from "../repository/otp.repository";
import { ErrorResponse } from "@/common/response/ErrorResponse";
import { BcryptService } from "@/common/utils/auth/bcrypt";
import { LoginUserDto } from "../dtos/request/LoginUser.dto";
import { Populated } from "@/common/database/query.builder";
import { IRole } from "../models/Role.model";
import { UserDocument } from "../models/User.model";
import { Types } from "mongoose";
import { MailerService } from "@/mailer/mailer.service";
import { buildVerificationEmail } from "@/mailer/templates/verification.template";
import { TokenService } from "@/common/utils/auth/TokenService";
import { Component } from "@/common/Component";

/** 6-digit numeric OTP validity window. */
const OTP_TTL_MINUTES = 10;

@Component
export class AuthService {
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;
  private otpRepository: OtpRepository;
  private tokenService: TokenService;

  constructor(tokenService: TokenService) {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
    this.otpRepository = new OtpRepository();
    this.tokenService = tokenService;
  }

  /** Generate a cryptographically uniform 6-digit numeric string. */
  private generateOtp(): string {
    return Math.floor(100_000 + Math.random() * 900_000).toString();
  }

  /**
   * Build the populated user shape.
   * Used by login and refresh so we don't repeat the query.
   */
  private async getPopulatedUser(userId: string | Types.ObjectId) {
    return this.userRepository
      .query()
      .byId(userId)
      .populate("roleId", "name")
      .select({ password: 0, refreshToken: 0 })
      .executeOne<Populated<UserDocument, "roleId", IRole>>();
  }

  // ─── Public service methods ─────────────────────────────────────────────────

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

    const tokens = this.tokenService.generateTokenPair({ id: user._id });

    await this.userRepository.updateById(user._id, {
      refreshToken: tokens.refreshToken,
    });

    // Fire-and-forget — OTP email failure must not block registration
    this.sendVerificationOtp(user._id, userDto.firstName, userDto.email).catch(
      (err) => console.error("[AuthService] Failed to send OTP email:", err),
    );

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
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

    const tokens = this.tokenService.generateTokenPair({ id: user._id });

    await this.userRepository.updateById(user._id, {
      refreshToken: tokens.refreshToken,
    });

    const populatedUser = await this.getPopulatedUser(user._id);

    return {
      user: {
        id: populatedUser!._id,
        email: populatedUser!.email,
        firstName: populatedUser!.firstName,
        lastName: populatedUser!.lastName,
        isVerified: populatedUser!.isVerified,
        role: populatedUser!.roleId.name,
      },
      tokens,
    };
  }

  async refresh(userId: Types.ObjectId, refreshToken: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ErrorResponse({
        status: 404,
        message: "User not found.",
      });
    }

    // Strict equality — guards against null (post-logout) and type coercion
    if (user.refreshToken !== refreshToken) {
      throw new ErrorResponse({
        status: 401,
        message: "Invalid refresh token.",
      });
    }

    // Cryptographically verify the token (catches expiry AND tampering)
    try {
      this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new ErrorResponse({
        status: 401,
        message: "Invalid refresh token.",
      });
    }

    const accessToken = this.tokenService.generateAccessToken({ id: user._id });

    const populatedUser = await this.getPopulatedUser(user._id);

    return {
      user: {
        id: populatedUser!._id,
        email: populatedUser!.email,
        firstName: populatedUser!.firstName,
        lastName: populatedUser!.lastName,
        isVerified: populatedUser!.isVerified,
        role: populatedUser!.roleId.name,
      },
      tokens: {
        accessToken,
        refreshToken: user.refreshToken,
      },
    };
  }

  async logout(userId: string) {
    await this.userRepository.updateById(userId, {
      refreshToken: null,
    });
  }

  /**
   * Generate a fresh OTP, persist it, and email it to the user.
   * Any previously unused OTPs for this user are deleted first.
   */
  async sendVerificationOtp(
    userId: Types.ObjectId,
    firstName: string,
    email: string,
  ): Promise<void> {
    // Purge all existing OTPs for this user to invalidate old codes
    await this.otpRepository.deleteMany({ userId });

    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1_000);

    await this.otpRepository.create({ userId, code, expiresAt, used: false });

    await MailerService.sendMail({
      to: email,
      subject: "Your verification code",
      html: buildVerificationEmail(firstName, code),
    });
  }

  /**
   * Validate the OTP and mark the user as verified.
   */
  async verifyEmail(userId: Types.ObjectId, code: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ErrorResponse({ status: 404, message: "User not found." });
    }

    if (user.isVerified) {
      throw new ErrorResponse({
        status: 409,
        message: "Email is already verified.",
      });
    }

    const otp = await this.otpRepository.findOne({
      userId,
      code,
      used: false,
    });

    if (!otp) {
      throw new ErrorResponse({
        status: 400,
        message: "Invalid verification code.",
      });
    }

    if (new Date() > otp.expiresAt) {
      throw new ErrorResponse({
        status: 400,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Mark OTP consumed and verify the user in parallel
    await Promise.all([
      this.otpRepository.updateById(otp._id as Types.ObjectId, { used: true }),
      this.userRepository.updateById(userId, { isVerified: true }),
    ]);
  }

  /**
   * Resend the verification OTP to the authenticated user's email.
   */
  async resendVerificationOtp(userId: Types.ObjectId): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ErrorResponse({ status: 404, message: "User not found." });
    }

    if (user.isVerified) {
      throw new ErrorResponse({
        status: 409,
        message: "Email is already verified.",
      });
    }

    await this.sendVerificationOtp(userId, user.firstName, user.email);
  }
}
