import { BaseRepository } from "@/common/database/base.repository";
import { IRole, Role } from "../models/Role.model";

export class RoleRepository extends BaseRepository<IRole> {
  constructor() {
    super(Role);
  }
}
