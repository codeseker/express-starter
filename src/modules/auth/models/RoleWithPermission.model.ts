import { model, Schema, Types } from "mongoose";

type IRoleWithPermission = {
  roleId: Types.ObjectId;
  permissionId: Types.ObjectId;
};

const roleWithPermissionSchema = new Schema<IRoleWithPermission>({
  roleId: {
    type: Types.ObjectId,
    ref: "Role",
    require: true,
  },
  permissionId: {
    type: Types.ObjectId,
    ref: "Permission",
    require: true,
  },
});

const RoleWithPermission = model<IRoleWithPermission>(
  "RoleWithPermission",
  roleWithPermissionSchema,
);

export default RoleWithPermission;
