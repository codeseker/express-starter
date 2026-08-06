import { SchemaBuilder } from "@/common/schema/builder";
import { InferDocument } from "@/common/schema/types";
import { model } from "mongoose";

interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

const userBuilder = new SchemaBuilder<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
})
  .withSoftDelete()
  .withTimestamps();

export type UserDocument = InferDocument<typeof userBuilder>;

export const User = model("User", userBuilder.build());
