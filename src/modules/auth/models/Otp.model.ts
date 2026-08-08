import { SchemaBuilder } from "@/common/schema/builder";
import { InferDocument } from "@/common/schema/types";
import { model, Types } from "mongoose";

interface IOtp {
  userId: Types.ObjectId;
  code: string;
  expiresAt: Date;
  used: boolean;
}

const otpBuilder = new SchemaBuilder<IOtp>(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    used: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type OtpDocument = InferDocument<typeof otpBuilder>;

export const Otp = model("Otp", otpBuilder.build());
