import { Schema } from "mongoose";
import { ISchemaFeature } from "../types";

export interface ISlugDoc {
  slug: string;
}

export class SlugFeature implements ISchemaFeature<ISlugDoc, {}> {
  constructor(private readonly sourceField: string) {}

  public apply(schema: Schema<any, any, any, any, any, any>): void {
    schema.add({
      slug: { type: String, unique: true, sparse: true, index: true },
    });

    const source = this.sourceField;

    schema.pre("validate", function (next) {
      const doc = this as any;
      if (doc.isModified(source) && doc[source]) {
        doc.slug = doc[source]
          .toString()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      // @ts-ignore
      next();
    });
  }
}
