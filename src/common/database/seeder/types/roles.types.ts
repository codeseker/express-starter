import { IRole } from "@/modules/auth/models/Role.model";

export const ROLES = {
  ADMIN: {
    name: "Admin",
    description: "Admin role",
    isSystem: true,
  },
  USER: {
    name: "User",
    description: "User role",
    isSystem: true,
  },
} as const;

export type RoleType = keyof typeof ROLES;
export type RoleName = (typeof ROLES)[RoleType]["name"];

export const ALL_ROLES: IRole[] = Object.values(ROLES);
