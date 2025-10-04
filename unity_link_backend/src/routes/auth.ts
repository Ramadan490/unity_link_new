// src/routes/auth.ts
import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import prisma from "../utils/prisma";

const router = Router();

// 🔑 Secret for JWT (load from .env in production!)
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const TOKEN_EXPIRY = "7d";

// ==================== REGISTER ====================
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const existing = await prisma.profile.findUnique({ where: { email } });
    if (existing) throw new AppError("Email already in use", 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.profile.create({
      data: {
        email,
        name: name || email.split("@")[0],
        role: "super_admin", // ✅ you can later promote/demote
        hashedPassword,
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// ==================== LOGIN ====================
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.profile.findUnique({ where: { email } });
    if (!user) throw new AppError("Invalid credentials", 401);

    // ✅ Ensure hashedPassword exists
    if (!user.hashedPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) throw new AppError("Invalid credentials", 401);

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// ==================== PROFILE (SESSION CHECK) ====================
router.get("/me", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new AppError("Unauthorized", 401);

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await prisma.profile.findUnique({ where: { id: decoded.id } });
    if (!user) throw new AppError("User not found", 404);

    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
