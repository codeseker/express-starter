/**
 * Abstract base class for database implementations.
 *
 * Using `abstract class` instead of `interface` is required so that
 * `@Primary` can walk the prototype chain (`Object.getPrototypeOf`)
 * and register the correct mapping  Database → MongoDBImplementation.
 *
 * `implements` is TypeScript-only and creates no runtime prototype link.
 */
export abstract class Database {
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
}
