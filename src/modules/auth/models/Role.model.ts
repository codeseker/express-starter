import { model, Schema, Types } from "mongoose";

export type IRole = {
  name: string;
  description?: string;
  permissions: Types.ObjectId[];
  isSystem: boolean;
}

const roleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
  isSystem: { type: Boolean, default: false },
});

export const Role = model<IRole>("Role", roleSchema);
