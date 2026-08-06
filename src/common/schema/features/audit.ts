import { Schema, Types } from "mongoose";
import { ISchemaFeature } from "../types";

export interface IAuditDoc {
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
}

export class AuditFeature implements ISchemaFeature<IAuditDoc, {}> {
  public apply(schema: Schema<any, any, any, any, any, any>): void {
    schema.add({
      createdBy: { type: Schema.Types.ObjectId, default: null, index: true },
      updatedBy: { type: Schema.Types.ObjectId, default: null },
    });
  }
}
