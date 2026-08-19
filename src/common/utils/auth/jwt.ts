import { env } from "@/common/config/env";
import jwt, {
  SignOptions,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";
import { TokenPair, TokenPayload, TokenService } from "./TokenService";
import { Component } from "@/common/Component";
import { Primary } from "@/common/Primary";

@Component
@Primary
export class JwtService extends TokenService {
  /**
   * Generate a JWT.
   */
  private generateToken(payload: any): string {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
      expiresIn: env.ACCESS_TOKEN_EXPIRY_TIME as SignOptions["expiresIn"],
    });
  }

  /**
   * Generate Access Token
   */
  generateAccessToken(payload: TokenPayload): string {
    return this.generateToken(payload);
  }

  /**
   * Generate Refresh Token
   */
  generateRefreshToken(payload: TokenPayload): string {
    return this.generateToken(payload);
  }

  /**
   * Generate both tokens.
   */
  generateTokenPair(payload: TokenPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify Access Token.
   */
  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
  }

  /**
   * Verify Refresh Token.
   */
  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
  }

  /**
   * Decode token without verification.
   */
  decode(token: string): TokenPayload | null {
    return jwt.decode(token) as TokenPayload | null;
  }

  /**
   * Check whether token is expired.
   */
  isExpired(token: string): boolean {
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
  isExpiredRefreshToken(token: string): boolean {
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
  validateAccessToken(token: string): {
    valid: boolean;
    payload?: TokenPayload;
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
