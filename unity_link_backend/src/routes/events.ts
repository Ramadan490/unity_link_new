import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/events - Get all events (with community filtering)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query;

    const where = communityId ? { communityId: communityId as string } : {};

    const events = await prisma.event.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        community: { select: { id: true, name: true } },
      },
      orderBy: { date: "asc" },
    });

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// POST /api/events - Create new event
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, date, location, description, communityId, createdById } =
      req.body;

    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        location,
        description,
        communityId,
        createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        community: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// DELETE /api/events/:id - Delete event
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.event.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
