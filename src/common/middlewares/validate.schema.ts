import { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Validates req.body against a Zod schema.
 * Works as both a method decorator and a property decorator.
 *
 * - Method decorator: wraps the method with validation.
 * - Property decorator (experimentalDecorators): intercepts class-field
 *   assignment via a prototype getter/setter so the handler is wrapped
 *   when the constructor sets the field.
 *
 * Compatible with experimentalDecorators + emitDecoratorMetadata.
 */
export function ValidateBody(schema: z.ZodTypeAny) {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor?: PropertyDescriptor,
  ): void {
    // ── Method decorator ───────────────────────────────────
    if (descriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = function (
        this: any,
        req: Request,
        res: Response,
        next: NextFunction,
      ) {
        return applyValidation(schema, req, res, next, originalMethod, this);
      };

      return;
    }

    // ── Property decorator (class field / arrow function) ──
    // With experimentalDecorators, descriptor is undefined for class fields.
    // We define a getter/setter on the prototype so that when the constructor
    // runs `this.register = asyncHandler(...)`, the setter wraps the handler
    // with validation before storing it.
    const slot = Symbol(`__v_${String(propertyKey)}`);

    Object.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      get() {
        return this[slot];
      },
      set(value: any) {
        if (typeof value === "function") {
          const handler = value;
          this[slot] = (req: Request, res: Response, next: NextFunction) =>
            applyValidation(schema, req, res, next, handler, this);
        } else {
          this[slot] = value;
        }
      },
    });
  };
}

/** Shared validation + forwarding logic for both decorator paths. */
function applyValidation(
  schema: z.ZodTypeAny,
  req: Request,
  res: Response,
  next: NextFunction,
  handler: Function,
  context: any,
): any {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.reduce<Record<string, string>>(
      (acc, issue) => {
        const field = issue.path.join(".");
        if (!acc[field]) acc[field] = issue.message;
        return acc;
      },
      {},
    );

    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation failed",
      errors,
    });
  }

  req.body = result.data;
  return handler.call(context, req, res, next);
}
