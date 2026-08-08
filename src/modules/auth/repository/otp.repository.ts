import { BaseRepository } from "@/common/database/base.repository";
import { Otp, OtpDocument } from "../models/Otp.model";

export class OtpRepository extends BaseRepository<OtpDocument> {
  constructor() {
    super(Otp);
  }
}
