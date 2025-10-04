// shared/types/event.ts

export type Event = {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  location?: string;
  createdById: string; // match backend Prisma field
  status: "upcoming" | "past" | "cancelled";
  donations: number;
  goal: number;
  attending: string[]; // user IDs of attendees
  communityId: string;
  createdAt: string;
  updatedAt: string;
};
