import { Permission, PERMISSIONS } from "./permissions.types";
import { RoleName } from "./roles.types";

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  Admin: [PERMISSIONS.ALL.ALL],
  User: [PERMISSIONS.USER.READ],
};
