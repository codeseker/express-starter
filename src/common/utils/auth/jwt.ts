import { env } from "@/common/config/env";
import jwt, {
  JwtPayload,
  Secret,
  SignOptions,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";
import { Types } from "mongoose";

/**
 * Payload stored inside JWT.
 * Extend this if you need more fields.
 */
export interface JwtTokenPayload extends JwtPayload {
  id: Types.ObjectId;
}

/**
 * Token pair returned after login/refresh.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtService {
  /**
   * Generate a JWT.
   */
  private static generateToken(
    payload: JwtTokenPayload,
    secret: Secret,
    expiresIn: SignOptions["expiresIn"],
  ): string {
    return jwt.sign(payload, secret, {
      expiresIn,
    });
  }

  /**
   * Generate Access Token
   */
  static generateAccessToken(payload: JwtTokenPayload): string {
    return this.generateToken(
      payload,
      env.ACCESS_TOKEN_SECRET,
      env.ACCESS_TOKEN_EXPIRY_TIME as SignOptions["expiresIn"],
    );
  }

  /**
   * Generate Refresh Token
   */
  static generateRefreshToken(payload: JwtTokenPayload): string {
    return this.generateToken(
      payload,
      env.REFRESH_TOKEN_SECRET,
      env.REFRESH_TOKEN_EXPIRY_TIME as SignOptions["expiresIn"],
    );
  }

  /**
   * Generate both tokens.
   */
  static generateTokenPair(payload: JwtTokenPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify Access Token.
   */
  static verifyAccessToken(token: string): JwtTokenPayload {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtTokenPayload;
  }

  /**
   * Verify Refresh Token.
   */
  static verifyRefreshToken(token: string): JwtTokenPayload {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JwtTokenPayload;
  }

  /**
   * Decode token without verification.
   */
  static decode(token: string): JwtTokenPayload | null {
    return jwt.decode(token) as JwtTokenPayload | null;
  }

  /**
   * Check whether token is expired.
   */
  static isExpired(token: string): boolean {
    try {
      jwt.verify(token, env.ACCESS_TOKEN_SECRET);
      return false;
    } catch (error) {
      return error instanceof TokenExpiredError;
    }
  }

  /**
   * Check whether refresh token is expired.
   */
  static isExpiredRefreshToken(token: string): boolean {
    try {
      jwt.verify(token, env.REFRESH_TOKEN_SECRET);
      return false;
    } catch (error) {
      return error instanceof TokenExpiredError;
    }
  }

  /**
   * Validate token safely.
   */
  static validateAccessToken(token: string): {
    valid: boolean;
    payload?: JwtTokenPayload;
    error?: string;
  } {
    try {
      const payload = this.verifyAccessToken(token);

      return {
        valid: true,
        payload,
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return {
          valid: false,
          error: "TOKEN_EXPIRED",
        };
      }

      if (error instanceof JsonWebTokenError) {
        return {
          valid: false,
          error: "INVALID_TOKEN",
        };
      }

      return {
        valid: false,
        error: "TOKEN_VERIFICATION_FAILED",
      };
    }
  }
}
