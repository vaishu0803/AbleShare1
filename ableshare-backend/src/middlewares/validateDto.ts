import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateDto =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
