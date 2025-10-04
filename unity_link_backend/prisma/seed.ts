import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ✅ Create or reuse Super Admin
  const superAdmin = await prisma.profile.upsert({
    where: { email: "admin@unitylink.com" },
    update: {},
    create: {
      email: "admin@unitylink.com",
      name: "Admin User",
      role: "super_admin",
      password: "temporary_password", // Remove in production
      hashedPassword: "hashed_value_here", // Use bcrypt in real app
    },
  });

  // ✅ Create or reuse Default Community
  const community = await prisma.community.upsert({
    where: { name: "Default Community" },
    update: {},
    create: {
      name: "Default Community",
      description: "This is the default test community",
      superAdminId: superAdmin.id,
    },
  });

  // ✅ Add super admin as community member
  await prisma.communityMember.upsert({
    where: {
      communityId_userId: {
        communityId: community.id,
        userId: superAdmin.id,
      },
    },
    update: {},
    create: {
      communityId: community.id,
      userId: superAdmin.id,
      role: "board_member",
    },
  });

  // ✅ Create sample Event (using future date)
  await prisma.event.upsert({
    where: { id: "seed-event-1" },
    update: {},
    create: {
      id: "seed-event-1",
      title: "Community BBQ",
      description:
        "Join us for our annual community BBQ with food, games, and fun!",
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      location: "Central Park",
      status: "UPCOMING",
      donations: 0,
      goal: 1000,
      communityId: community.id,
      createdById: superAdmin.id,
    },
  });

  // ✅ Create sample Announcement
  await prisma.announcement.upsert({
    where: { id: "seed-announcement-1" },
    update: {},
    create: {
      id: "seed-announcement-1",
      title: "Welcome to Unity Link!",
      content: "We're excited to launch our new community app 🎉",
      communityId: community.id,
      createdById: superAdmin.id,
      priority: "high",
    },
  });

  // ✅ Create sample Request
  const request = await prisma.request.upsert({
    where: { id: "seed-request-1" },
    update: {},
    create: {
      id: "seed-request-1",
      title: "Need help with groceries",
      description:
        "Looking for someone to assist with grocery shopping this weekend.",
      status: "open",
      communityId: community.id,
      createdById: superAdmin.id,
    },
  });

  // ✅ Create sample Reply
  await prisma.reply.upsert({
    where: { id: "seed-reply-1" },
    update: {},
    create: {
      id: "seed-reply-1",
      content: "I can help you with groceries on Saturday!",
      requestId: request.id,
      createdById: superAdmin.id,
    },
  });

  // ✅ Create sample Memorial
  await prisma.memorial.upsert({
    where: { id: "seed-memorial-1" },
    update: {},
    create: {
      id: "seed-memorial-1",
      name: "John Doe",
      description: "In loving memory of John Doe, a beloved community member.",
      communityId: community.id,
      createdById: superAdmin.id,
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
