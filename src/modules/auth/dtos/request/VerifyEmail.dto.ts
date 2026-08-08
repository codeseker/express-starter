import { z } from "zod";

export const verifyEmailSchema = z
  .object({
    code: z
      .string()
      .length(6, "Verification code must be exactly 6 digits")
      .regex(/^\d{6}$/, "Verification code must contain only digits"),
  })
  .strict();

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
