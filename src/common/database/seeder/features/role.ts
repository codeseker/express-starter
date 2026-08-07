import { IRole, Role } from "@/modules/auth/models/Role.model";
import { HydratedDocument } from "mongoose";
import { ALL_ROLES } from "../types/roles.types";

export class RoleSeeder {
  private getRolesData(): IRole[] {
    return ALL_ROLES;
  }

  async seed(): Promise<HydratedDocument<IRole>[]> {
    const data = this.getRolesData();
    console.log("Seeding roles...");

    if ((await Role.countDocuments()) > 0) {
      console.log("Roles already seeded");
      return await Role.find();
    }
    const roles = await Role.insertMany(data);
    console.log("Roles seeded successfully");
    return roles;
  }

  async drop() {
    await Role.deleteMany({});
  }
}
