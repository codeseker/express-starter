import { Types } from "mongoose";

export interface TokenPayload {
  id: Types.ObjectId;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export abstract class TokenService {
  abstract generateAccessToken(payload: TokenPayload): string;

  abstract generateRefreshToken(payload: TokenPayload): string;

  abstract generateTokenPair(payload: TokenPayload): TokenPair;

  abstract verifyAccessToken(token: string): TokenPayload;

  abstract verifyRefreshToken(token: string): TokenPayload;

  abstract decode(token: string): TokenPayload | null;

  abstract isExpired(token: string): boolean;
  abstract isExpiredRefreshToken(token: string): boolean;

  abstract validateAccessToken(token: string): {
    valid: boolean;
    payload?: TokenPayload;
    error?: string;
  };
}
