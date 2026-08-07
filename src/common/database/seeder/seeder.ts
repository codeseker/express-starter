import MongoDBImplementation from "@/common/config/database";
import { RoleSeeder } from "./features/role";
import { PermissionsSeeder } from "./features/permissions";

class Seeder {
  database: MongoDBImplementation;
  roles: RoleSeeder;
  permissions: PermissionsSeeder;

  constructor() {
    this.database = new MongoDBImplementation();
    this.roles = new RoleSeeder();
    this.permissions = new PermissionsSeeder();
  }

  async init() {
    await this.database.connect();
    await this.roles.seed();
    await this.permissions.seed();
  }

  async seed() {
    try {
      await this.init();
    } catch (error) {
      console.log(error);
    } finally {
      await this.database.close();
    }
  }
}

const seeder = new Seeder();
seeder.seed();
