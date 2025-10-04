import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

// Global error handler
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("❌ Error:", err);

  // Custom AppError (e.g., auth failures)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma: record not found
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }

  // Prisma: other DB errors
  if (err.code?.startsWith("P")) {
    return res.status(400).json({
      error: "Database error",
      details: err.message,
    });
  }

  // Fallback
  res.status(500).json({ error: "Internal Server Error" });
}
