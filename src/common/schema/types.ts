import { HydratedDocument, Model, Schema } from "mongoose";
import type { SchemaBuilder } from "./builder";

/**
 * A reusable schema feature.
 *
 * Implementations should mutate the provided schema by adding fields,
 * middleware, indexes, virtuals, or instance/static methods.
 *
 * The generic parameters describe the additional document fields and
 * instance methods that the feature contributes.
 */
export interface ISchemaFeature<TExtraDoc = {}, TExtraMethods = {}> {
  apply(schema: Schema<any, any, any, any, any, any>): void;
}

/**
 * Infer the raw document shape from a SchemaBuilder instance.
 *
 * This is the underlying interface representing the schema fields,
 * without hydration or instance method wrappers.
 */
export type InferRawDoc<T> =
  T extends SchemaBuilder<infer TDoc, any, any, any, any> ? TDoc : never;

/**
 * Infer the hydrated document type from a SchemaBuilder.
 *
 * This includes both the base document fields and any instance method types
 * that were accumulated through the builder feature chain.
 */
export type InferDocument<T> =
  T extends SchemaBuilder<
    infer TDoc,
    infer TMethods,
    infer TQueryHelpers,
    any,
    any
  >
    ? HydratedDocument<TDoc, TMethods, TQueryHelpers>
    : never;

/**
 * Infer the Mongoose model type from a SchemaBuilder.
 *
 * This type includes the document shape, query helpers, and any static methods
 * or statics added through the builder.
 */
export type InferModel<T> =
  T extends SchemaBuilder<
    infer TDoc,
    infer TMethods,
    infer TQueryHelpers,
    infer TVirtuals,
    infer TStatics
  >
    ? Model<TDoc, TQueryHelpers, TMethods, TVirtuals> & TStatics
    : never;
