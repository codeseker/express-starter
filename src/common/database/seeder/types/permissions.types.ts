import { IPermission } from "@/modules/auth/models/Permission.model";

// USER => user role => PERMISSIONS?

export const PERMISSIONS = {
  ALL: {
    ALL: {
      key: "all",
      module: "All",
      action: "All",
      description: "All permissions",
    },
  },
  USER: {
    CREATE: {
      key: "user:create",
      module: "User",
      action: "Create",
      description: "Create user",
    },
    READ: {
      key: "user:read",
      module: "User",
      action: "Read",
      description: "Read user",
    },
    UPDATE: {
      key: "user:update",
      module: "User",
      action: "Update",
      description: "Update user",
    },
    DELETE: {
      key: "user:delete",
      module: "User",
      action: "Delete",
      description: "Delete user",
    },
  },
} as const;

export type Permission = {
  [M in keyof typeof PERMISSIONS]: {
    [A in keyof (typeof PERMISSIONS)[M]]: (typeof PERMISSIONS)[M][A];
  }[keyof (typeof PERMISSIONS)[M]];
}[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: IPermission[] = Object.values(
  PERMISSIONS,
).flatMap((modulePermissions) => Object.values(modulePermissions));
