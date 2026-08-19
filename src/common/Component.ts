import Container from "./Container";

/**
 * Decorator that marks a class as a component.
 * The class will be registered in the IoC container.
 *
 * Example:
 * @Component
 * class Logger { ... }
 */
export function Component(target: any): void {
  Container.register(target);
  // Optionally you can store additional metadata (e.g., name, scope)
}
