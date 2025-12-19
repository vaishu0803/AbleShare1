import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }))
    });
  }

  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }

  console.error("SERVER ERROR:", err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
