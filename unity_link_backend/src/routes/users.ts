// src/routes/users.ts
import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

// ===== Get all users =====
router.get("/", async (_req, res, next) => {
  try {
    const users = await prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// ===== Get single user =====
router.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.profile.findUnique({
      where: { id: req.params.id },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ===== Update user =====
router.put("/:id", async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const updated = await prisma.profile.update({
      where: { id: req.params.id },
      data: { name, email, role },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ===== Delete user =====
router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.profile.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
