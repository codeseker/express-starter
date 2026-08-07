import { model, Schema, Types } from "mongoose";

export type IRole = {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  isSystem: boolean;
};

const roleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  isSystem: { type: Boolean, default: false },
});

export const Role = model<IRole>("Role", roleSchema);
