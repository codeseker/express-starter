import { env } from "@/common/config/env";
import bcrypt from "bcryptjs";

export class BcryptService {
  /**
   * Hash a plain text string.
   */
  static async hash(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  /**
   * Compare plain text with hashed value.
   */
  static async compare(
    plainText: string,
    hashedValue: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainText, hashedValue);
  }

  /**
   * Check if a string is already a bcrypt hash.
   */
  static isHash(value: string): boolean {
    return /^\$2[aby]\$\d{2}\$.{53}$/.test(value);
  }

  /**
   * Generate a salt.
   */
  static async generateSalt(): Promise<string> {
    return bcrypt.genSalt(10);
  }

  /**
   * Hash using a provided salt.
   */
  static async hashWithSalt(data: string, salt: string): Promise<string> {
    return bcrypt.hash(data, salt);
  }
}
