// shared/types/announcement.ts
export type Announcement = {
  id: string;
  title: string;
  content: string;
  author?: string;
  priority?: "high" | "normal";
  communityId: string;
  createdAt: string;
  updatedAt: string;
  date?: string;
  category?: string; // ✅ added so TS doesn’t complain
};
