// src/utils/prisma.ts
import { PrismaClient } from "@prisma/client";

// Prevent multiple Prisma Client instances in dev (causes "too many connections")
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // optional: remove if too noisy
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
