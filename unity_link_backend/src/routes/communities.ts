// src/routes/communities.ts
import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

// ===== Get members of a community =====
router.get("/:id/members", async (req, res) => {
  try {
    const members = await prisma.communityMember.findMany({
      where: { communityId: req.params.id },
      include: { user: true }, // ✅ relation is "user", not "profile"
    });
    res.json(members);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// ===== Add member to a community =====
router.post("/:id/members", async (req, res) => {
  const { userId, role } = req.body;
  try {
    const member = await prisma.communityMember.create({
      data: {
        communityId: req.params.id,
        userId, // ✅ your schema expects "userId"
        role: role || "community_member",
      },
    });
    res.json(member);
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Failed to add member" });
  }
});

export default router;
