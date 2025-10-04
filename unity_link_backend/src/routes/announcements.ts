import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/announcements - Get all announcements (with community filtering)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query;

    const where = communityId ? { communityId: communityId as string } : {};

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        community: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// POST /api/announcements - Create new announcement
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      communityId,
      createdById,
      priority = "normal",
    } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        communityId,
        createdById,
        priority,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        community: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// DELETE /api/announcements/:id - Delete announcement
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.announcement.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

export default router;
