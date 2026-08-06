import { HydratedDocument, Model, Schema } from "mongoose";
import type { SchemaBuilder } from "./builder";

export interface ISchemaFeature<TExtraDoc = {}, TExtraMethods = {}> {
  apply(schema: Schema<any, any, any, any, any, any>): void;
}

/**
 * Extracts the raw, unhydrated accumulated document shape (e.g. IUser & ISoftDeleteDoc & ...).
 * Use this as the first generic parameter when explicitly calling Mongoose's `model<TRawDocType>()`.
 */
export type InferRawDoc<T> =
  T extends SchemaBuilder<infer TDoc, any, any, any, any> ? TDoc : never;

/**
 * Extracts the accumulated HydratedDocument (including instance methods and fields).
 * Use this for Repository layer type annotations and instance variables.
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
 * Extracts the accumulated Model type (including static methods and query helpers).
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
