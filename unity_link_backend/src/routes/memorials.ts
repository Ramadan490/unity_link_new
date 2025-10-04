import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/memorials - Get all memorials
router.get("/", async (req: Request, res: Response) => {
  try {
    const memorials = await prisma.memorial.findMany({
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        community: { select: { id: true, name: true } },
      },
    });
    res.json(memorials);
  } catch (error) {
    console.error("Error fetching memorials:", error);
    res.status(500).json({ error: "Failed to fetch memorials" });
  }
});

// POST /api/memorials - Create new memorial
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, description, communityId, createdById } = req.body;

    const memorial = await prisma.memorial.create({
      data: {
        name,
        description,
        communityId,
        createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        community: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(memorial);
  } catch (error) {
    console.error("Error creating memorial:", error);
    res.status(500).json({ error: "Failed to create memorial" });
  }
});

// DELETE /api/memorials/:id - Delete memorial
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.memorial.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting memorial:", error);
    res.status(500).json({ error: "Failed to delete memorial" });
  }
});

export default router;
