import { SchemaBuilder } from "@/common/schema/builder";
import { InferDocument } from "@/common/schema/types";
import { model, Types } from "mongoose";

interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  refreshToken: string;
  roleId: Types.ObjectId;
}

const userBuilder = new SchemaBuilder<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  roleId: { type: Types.ObjectId, ref: "Role", required: true },
  refreshToken: { type: String, required: false },
})
  .withSoftDelete()
  .withTimestamps();

export type UserDocument = InferDocument<typeof userBuilder>;

export const User = model("User", userBuilder.build());
