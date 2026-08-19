import Container from "./Container";

/**
 * Class decorator that marks an implementation as the **primary** choice
 * for its parent (abstract) class.
 *
 * What it does:
 * 1. Discovers the parent class via the prototype chain.
 * 2. Registers a mapping  parentClass → this class  in the container.
 *
 * NOTE: @Primary alone does NOT register the class as a component.
 * Always pair it with @Component so the class is both registered
 * and marked as the default implementation.
 *
 * When the container resolves a dependency whose parameter type is the
 * abstract parent, it will automatically use the @Primary implementation.
 *
 * @example
 *   abstract class Logger { abstract log(msg: string): void; }
 *
 *   @Component
 *   @Primary
 *   class ConsoleLogger extends Logger { log(msg) { console.log(msg); } }
 *
 *   @Component
 *   class App {
 *     constructor(private logger: Logger) {}   // resolved as ConsoleLogger
 *   }
 */
export function Primary(target: any): void {
  // Walk the prototype chain to find the direct parent class.
  // For `class JwtService extends TokenService`:
  //   prototype chain  →  JwtService.prototype  →  TokenService.prototype
  const parentProto = Object.getPrototypeOf(target.prototype);
  const parentClass = parentProto?.constructor;

  if (!parentClass || parentClass === Function.prototype) {
    throw new Error(
      `@Primary cannot be applied to "${target.name}" because it does not extend a parent class.`,
    );
  }

  // Register the primary mapping  (abstract class → concrete class)
  // NOTE: @Primary does NOT register the class — use @Component for that.
  Container.setPrimary(parentClass, target);
}
