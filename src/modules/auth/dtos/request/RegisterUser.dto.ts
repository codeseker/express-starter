import { z } from "zod";

export const registerUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(3),
    lastName: z.string().min(3),
  })
  .strict();

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
