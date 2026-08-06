import { model, Schema, Types } from "mongoose";

export type IPermission = {
  key: string; // "posts:create" — resource:action, unique
  module: string; // "posts"  (denormalized for easy filtering/grouping in UI)
  action: string; // "create"
  description?: string;
};

const permissionSchema = new Schema<IPermission>({
  key: { type: String, required: true, unique: true, index: true },
  module: { type: String, required: true, index: true },
  action: { type: String, required: true },
  description: { type: String },
});

export const Permission = model<IPermission>("Permission", permissionSchema);
