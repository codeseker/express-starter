import { Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";

export function ValidateBody(schema: z.ZodTypeAny) {
  return function <This, Value extends RequestHandler<any, any, any, any>>(
    _value: undefined,
    context: ClassFieldDecoratorContext<This, Value>,
  ) {
    return function (this: This, originalHandler: Value): Value {
      const wrappedHandler = async (
        req: Parameters<Value>[0],
        res: Parameters<Value>[1],
        next: NextFunction,
      ) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
          const errors = result.error.issues.reduce<Record<string, string>>(
            (acc, issue) => {
              const field = issue.path.join(".");

              if (!acc[field]) {
                acc[field] = issue.message;
              }

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

        // Use the parsed/validated body
        req.body = result.data;

        // Validation succeeded → actual asyncHandler
        return originalHandler(req, res, next);
      };

      return wrappedHandler as Value;
    };
  };
}
