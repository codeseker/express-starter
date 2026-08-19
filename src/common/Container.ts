import "reflect-metadata";

// Concrete constructor (can be instantiated with `new`)
type Constructor<T = any> = new (...args: any[]) => T;

// Abstract class type (cannot be instantiated, but can appear as a DI key)
type AbstractClass<T = any> = abstract new (...args: any[]) => T;

// Union accepted by Container.get() — concrete or abstract
type Injectable<T = any> = Constructor<T> | AbstractClass<T>;

// Internal key type used in Maps/Sets — more permissive
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClass = abstract new (...args: any[]) => any;

/**
 * Simple IoC container.
 * - Registers classes decorated with @Component or @Primary.
 * - Resolves constructor dependencies via reflection (design:paramtypes).
 * - Caches instances as singletons.
 * - Supports @Primary mappings for abstract-class injection.
 * - Detects circular dependencies.
 */
class Container {
  // Cache of created singleton instances
  private static instances = new Map<AnyClass, any>();

  // Registry of all components (classes that were decorated)
  private static registry = new Set<AnyClass>();

  // Maps an abstract/parent class to its @Primary implementation
  private static primaryMap = new Map<AnyClass, AnyClass>();

  // Tracks classes currently being resolved (for circular-dependency detection)
  private static resolving = new Set<AnyClass>();

  /**
   * Register a class as a component.
   * Called automatically by @Component and @Primary.
   */
  static register(cls: AnyClass): void {
    this.registry.add(cls);
  }

  /**
   * Register a @Primary mapping: abstractClass → implementationClass.
   * Called automatically by the @Primary decorator.
   *
   * @throws If a primary is already registered for the same abstract class.
   */
  static setPrimary(
    abstractClass: AnyClass,
    implementationClass: AnyClass,
  ): void {
    if (this.primaryMap.has(abstractClass)) {
      const existing = this.primaryMap.get(abstractClass)!;
      throw new Error(
        `Duplicate @Primary for "${abstractClass.name}": ` +
          `"${existing.name}" is already registered as primary. ` +
          `Only one @Primary per abstract class is allowed.`,
      );
    }
    this.primaryMap.set(abstractClass, implementationClass);
  }

  /**
   * Retrieve an instance of the given class.
   * Creates it if not already cached, resolving all dependencies.
   *
   * Accepts both concrete classes and abstract classes.
   * If an abstract class is requested, the @Primary implementation is used.
   */
  static get<T>(cls: Injectable<T>): T {
    // If already instantiated, return the cached singleton
    if (this.instances.has(cls)) {
      return this.instances.get(cls);
    }

    // If not directly registered, check for a @Primary implementation
    if (!this.registry.has(cls)) {
      if (this.primaryMap.has(cls)) {
        const primary = this.primaryMap.get(cls)!;
        const instance = this.get(primary as Injectable<T>);
        // Also cache under the abstract key so future lookups are instant
        this.instances.set(cls, instance);
        return instance;
      }

      throw new Error(
        `Class "${cls.name}" is not registered as a component ` +
          `and has no @Primary implementation. ` +
          `Did you forget @Component or @Primary?`,
      );
    }

    // Circular dependency detection
    if (this.resolving.has(cls)) {
      throw new Error(
        `Circular dependency detected while resolving "${cls.name}".`,
      );
    }

    this.resolving.add(cls);

    try {
      // Resolve constructor parameter types using Reflect metadata
      const paramTypes: Constructor[] =
        Reflect.getMetadata("design:paramtypes", cls) || [];

      // Recursively resolve each dependency from the container
      const args = paramTypes.map((param) => this.get(param));

      // Create the instance and cache it
      const instance = new (cls as Constructor<T>)(...args);
      this.instances.set(cls, instance);
      return instance;
    } finally {
      this.resolving.delete(cls);
    }
  }

  /**
   * Reset the container (useful for testing).
   */
  static reset(): void {
    this.instances.clear();
    this.registry.clear();
    this.primaryMap.clear();
    this.resolving.clear();
  }
}

export default Container;
