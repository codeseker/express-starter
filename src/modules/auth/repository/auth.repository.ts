import { BaseRepository } from "@/common/database/base.repository";
import { User, UserDocument } from "../models/User.model";

export class UserRepository extends BaseRepository<UserDocument> {
  constructor() {
    super(User);
  }
}
