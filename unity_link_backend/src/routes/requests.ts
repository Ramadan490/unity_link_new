// src/routes/requests.ts
import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

// GET all requests
router.get("/", async (_req, res, next) => {
  try {
    const requests = await prisma.request.findMany({
      include: {
        createdBy: true,
        community: true,
        replies: { include: { createdBy: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// CREATE request
router.post("/", async (req, res, next) => {
  try {
    const { title, description, communityId, createdById } = req.body;

    const request = await prisma.request.create({
      data: {
        title,
        description,
        communityId,
        createdById,
      },
      include: { createdBy: true, community: true, replies: true },
    });

    res.json(request);
  } catch (err) {
    next(err);
  }
});

// ADD reply
router.post("/:id/replies", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, createdById } = req.body;

    const reply = await prisma.reply.create({
      data: {
        content,
        requestId: id,
        createdById,
      },
      include: { createdBy: true },
    });

    res.json(reply);
  } catch (err) {
    next(err);
  }
});

export default router;
