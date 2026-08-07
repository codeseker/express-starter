import {
  IPermission,
  Permission,
} from "@/modules/auth/models/Permission.model";
import { HydratedDocument } from "mongoose";
import { ALL_PERMISSIONS } from "../types/permissions.types";

export class PermissionsSeeder {
  private getPermissionsData(): IPermission[] {
    return ALL_PERMISSIONS;
  }

  async seed(): Promise<HydratedDocument<IPermission>[]> {
    const data = this.getPermissionsData();
    console.log("Seeding permissions...");

    if ((await Permission.countDocuments()) > 0) {
      console.log("Permissions already seeded");
      return await Permission.find();
    }
    const permissions = await Permission.insertMany(data);
    console.log("Permissions seeded successfully");
    return permissions;
  }

  async drop() {
    await Permission.deleteMany({});
  }
}
