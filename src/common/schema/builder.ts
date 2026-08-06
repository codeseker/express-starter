import {
  Model,
  Schema,
  SchemaDefinitionProperty,
  SchemaOptions,
} from "mongoose";
import { ISchemaFeature } from "./types";
import {
  SoftDeleteFeature,
  ISoftDeleteDoc,
  ISoftDeleteMethods,
} from "./features/softDelete";
import { AuditFeature, IAuditDoc } from "./features/audit";
import { TimestampsFeature, ITimestampsDoc } from "./features/timestamps";
import { SlugFeature, ISlugDoc } from "./features/slug";

/**
 * Fluent schema builder for Mongoose.
 *
 * Allows building a schema step-by-step, adding reusable features and plugins
 * while preserving the accumulated document and method types.
 */
export class SchemaBuilder<
  TDoc,
  TMethods = {},
  TQueryHelpers = {},
  TVirtuals = {},
  TStatics = {},
> {
  /**
   * Underlying Mongoose schema instance.
   * Keep this private to ensure all schema changes flow through the builder API.
   */
  private readonly _schema: Schema<any, any, any, any, any, any>;

  /**
   * Start with the base schema definition for the document.
   *
   * @param definition - The fields defined on the document.
   * @param options - Schema options such as timestamps, collection name, etc.
   */
  constructor(
    definition: SchemaDefinitionProperty<TDoc>,
    options?: SchemaOptions,
  ) {
    this._schema = new Schema(definition as any, options);
  }

  /**
   * Apply a reusable schema feature.
   *
   * Features are the building blocks for optional behavior like soft delete,
   * audit fields, timestamps, slug generation, and other shared schema logic.
   *
   * The returned builder preserves the accumulated document and method types.
   */
  public withFeature<FDoc = {}, FMethods = {}>(
    feature: ISchemaFeature<FDoc, FMethods>,
  ): SchemaBuilder<
    TDoc & FDoc,
    TMethods & FMethods,
    TQueryHelpers,
    TVirtuals,
    TStatics
  > {
    feature.apply(this._schema);
    return this as unknown as SchemaBuilder<
      TDoc & FDoc,
      TMethods & FMethods,
      TQueryHelpers,
      TVirtuals,
      TStatics
    >;
  }

  /**
   * Apply a Mongoose plugin directly to the schema.
   *
   * Use this when behavior is implemented as a plugin rather than a feature.
   * Plugins can also add fields, middleware, query helpers, or statics.
   */
  public withPlugin<FDoc = {}, FMethods = {}>(
    plugin: (schema: Schema, options?: any) => void,
    options?: any,
  ): SchemaBuilder<
    TDoc & FDoc,
    TMethods & FMethods,
    TQueryHelpers,
    TVirtuals,
    TStatics
  > {
    this._schema.plugin(plugin, options);
    return this as unknown as SchemaBuilder<
      TDoc & FDoc,
      TMethods & FMethods,
      TQueryHelpers,
      TVirtuals,
      TStatics
    >;
  }

  /**
   * Add soft-delete behavior to the schema.
   *
   * This typically adds fields such as `deletedAt` or `isDeleted` and may
   * also attach query helpers or middleware for soft deletion semantics.
   */
  public withSoftDelete(): SchemaBuilder<
    TDoc & ISoftDeleteDoc,
    TMethods & ISoftDeleteMethods,
    TQueryHelpers,
    TVirtuals,
    TStatics
  > {
    return this.withFeature(new SoftDeleteFeature());
  }

  /**
   * Add audit metadata behavior to the schema.
   *
   * This feature usually adds audit fields like `createdBy` and `updatedBy`
   * and may register middleware to populate them.
   */
  public withAudit(): SchemaBuilder<
    TDoc & IAuditDoc,
    TMethods,
    TQueryHelpers,
    TVirtuals,
    TStatics
  > {
    return this.withFeature(new AuditFeature()) as unknown as SchemaBuilder<
      TDoc & IAuditDoc,
      TMethods,
      TQueryHelpers,
      TVirtuals,
      TStatics
    >;
  }

  /**
   * Add automatic createdAt/updatedAt timestamp fields.
   *
   * This helper is useful when you want basic timestamp tracking without
   * manually defining those fields on every schema.
   */
  public withTimestamps(): SchemaBuilder<
    TDoc & ITimestampsDoc,
    TMethods,
    TQueryHelpers,
    TVirtuals,
    TStatics
  > {
    return this.withFeature(
      new TimestampsFeature(),
    ) as unknown as SchemaBuilder<
      TDoc & ITimestampsDoc,
      TMethods,
      TQueryHelpers,
      TVirtuals,
      TStatics
    >;
  }

  /**
   * Add slug generation support based on an existing document field.
   *
   * The source field must exist on the current document shape, ensuring
   * compile-time validation when building the schema.
   */
  public withSlug(
    sourceField: Extract<keyof TDoc, string>,
  ): SchemaBuilder<
    TDoc & ISlugDoc,
    TMethods,
    TQueryHelpers,
    TVirtuals,
    TStatics
  > {
    return this.withFeature(
      new SlugFeature(sourceField),
    ) as unknown as SchemaBuilder<
      TDoc & ISlugDoc,
      TMethods,
      TQueryHelpers,
      TVirtuals,
      TStatics
    >;
  }

  /**
   * Finalize the builder and return the Mongoose schema.
   *
   * The returned schema can be registered with `mongoose.model(...)`.
   */
  public build(): Schema<
    TDoc,
    Model<TDoc, TQueryHelpers, TMethods, TVirtuals>,
    TMethods,
    TQueryHelpers,
    TVirtuals,
    TStatics
  > {
    return this._schema as unknown as Schema<
      TDoc,
      Model<TDoc, TQueryHelpers, TMethods, TVirtuals>,
      TMethods,
      TQueryHelpers,
      TVirtuals,
      TStatics
    >;
  }
}
