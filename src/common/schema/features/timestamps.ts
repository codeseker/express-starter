import { Schema } from "mongoose";
import { ISchemaFeature } from "../types";

export interface ITimestampsDoc {
  createdAt: Date;
  updatedAt: Date;
}

export class TimestampsFeature implements ISchemaFeature<ITimestampsDoc, {}> {
  public apply(schema: Schema<any, any, any, any, any, any>): void {
    schema.set("timestamps", true);
  }
}
