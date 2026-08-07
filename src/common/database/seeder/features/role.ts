import { IRole, Role } from "@/modules/auth/models/Role.model";
import { HydratedDocument } from "mongoose";

export class RoleSeeder {
  private getRolesData(): IRole[] {
    return [
      {
        name: "Admin",
        description: "Admin role",
        isSystem: true,
      },
      {
        name: "User",
        description: "User role",
        isSystem: true,
      },
    ];
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
