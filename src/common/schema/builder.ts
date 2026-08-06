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

export class SchemaBuilder<
  TDoc,
  TMethods = {},
  TQueryHelpers = {},
  TVirtuals = {},
  TStatics = {},
> {
  private readonly _schema: Schema<any, any, any, any, any, any>;

  constructor(
    definition: SchemaDefinitionProperty<TDoc>,
    options?: SchemaOptions,
  ) {
    this._schema = new Schema(definition as any, options);
  }

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

  public withSoftDelete(): SchemaBuilder<
    TDoc & ISoftDeleteDoc,
    TMethods & ISoftDeleteMethods,
    TQueryHelpers,
    TVirtuals,
    TStatics
  > {
    return this.withFeature(new SoftDeleteFeature());
  }

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
