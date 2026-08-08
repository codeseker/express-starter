import { z } from "zod";

export const loginUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export type LoginUserDto = z.infer<typeof loginUserSchema>;
