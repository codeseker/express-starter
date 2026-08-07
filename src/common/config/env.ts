import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),
  ACCESS_TOKEN_EXPIRY_TIME: z.string().default("15m"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
  REFRESH_TOKEN_EXPIRY_TIME: z.string().default("7d"),

  APP_MODE: z.enum(["dev", "prod", "test"], {
    message: "APP_MODE is required and must be one of: dev, prod, test",
  }),

  MONGO_DEV_URI: z.string().optional(),
  MONGO_PROD_URI: z.string().optional(),
  MONGO_TEST_URI: z.string().optional(),

  DB_NAME: z.enum(["mongodb"]).default("mongodb"),

  ADMIN_USER_PASSWORD: z.string().optional(),
  USER_PASSWORD: z.string().optional(),

  FRONTEND_DEV_URI: z.string().optional(),
  FRONTEND_PROD_URI: z.string().optional(),
  FRONTEND_TEST_URI: z.string().optional(),

  PORT: z.preprocess(
    (val) => (val === undefined || val === "" ? undefined : Number(val)),
    z.number().default(8000),
  ),
});

export type APP_MODE_TYPE = z.infer<typeof envSchema>["APP_MODE"];

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    z.treeifyError(parsedEnv.error),
  );
  process.exit(1);
}

export const env = parsedEnv.data;
