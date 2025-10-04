// src/middleware/requireAdminOrBoard.ts
import { NextFunction, Request, Response } from "express";

// Allow only super_admin or board_member
export function requireAdminOrBoard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get user from authenticated request (adjust based on your auth setup)
  const user = (req as any).user; // Or however you attach user to request

  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (user.role === "super_admin" || user.role === "board_member") {
    return next();
  }

  return res
    .status(403)
    .json({ error: "Not authorized. Admin or board member access required." });
}
