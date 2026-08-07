import { HydratedDocument } from "mongoose";

import RoleWithPermissionModel, {
  IRoleWithPermission,
} from "@/modules/auth/models/RoleWithPermission.model";
import { Role } from "@/modules/auth/models/Role.model";
import { Permission as PermissionModel } from "@/modules/auth/models/Permission.model";

import { ROLE_PERMISSIONS } from "../types/rolesWithPermissions.types";
import { RoleName } from "../types/roles.types";

export class RoleWithPermissionSeeder {
  private async getRolesWithPermissionsData(): Promise<IRoleWithPermission[]> {
    const roles = await Role.find().lean();
    const permissions = await PermissionModel.find().lean();

    const roleMap = new Map(
      roles.map((role) => [role.name as RoleName, role._id]),
    );

    const permissionMap = new Map(
      permissions.map((permission) => [permission.key, permission._id]),
    );

    const data: IRoleWithPermission[] = [];

    for (const [roleName, rolePermissions] of Object.entries(
      ROLE_PERMISSIONS,
    )) {
      const roleId = roleMap.get(roleName as RoleName);

      if (!roleId) {
        throw new Error(`Role '${roleName}' not found.`);
      }

      for (const permission of rolePermissions) {
        const permissionId = permissionMap.get(permission.key);

        if (!permissionId) {
          throw new Error(`Permission '${permission.key}' not found.`);
        }

        data.push({
          roleId,
          permissionId,
        });
      }
    }

    return data;
  }

  async seed(): Promise<HydratedDocument<IRoleWithPermission>[]> {
    const data = await this.getRolesWithPermissionsData();

    console.log("Seeding role permissions...");

    if ((await RoleWithPermissionModel.countDocuments()) > 0) {
      console.log("Role permissions already seeded");
      return await RoleWithPermissionModel.find();
    }

    const rolePermissions = await RoleWithPermissionModel.insertMany(data);

    console.log("Role permissions seeded successfully");

    return rolePermissions;
  }

  async drop() {
    await RoleWithPermissionModel.deleteMany({});
  }
}
