import { Schema } from "mongoose";
import { ISchemaFeature } from "../types";

export interface ISoftDeleteDoc {
  isDeleted: boolean;
  deletedAt?: Date | null;
}

export interface ISoftDeleteMethods {
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

export class SoftDeleteFeature implements ISchemaFeature<
  ISoftDeleteDoc,
  ISoftDeleteMethods
> {
  public apply(schema: Schema<any, any, any, any, any, any>): void {
    schema.add({
      isDeleted: { type: Boolean, default: false, index: true },
      deletedAt: { type: Date, default: null },
    });

    schema.methods.softDelete = async function (): Promise<any> {
      this.isDeleted = true;
      this.deletedAt = new Date();
      return this.save();
    };

    schema.methods.restore = async function (): Promise<any> {
      this.isDeleted = false;
      this.deletedAt = null;
      return this.save();
    };
  }
}
