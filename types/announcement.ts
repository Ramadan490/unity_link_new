// types/announcement.ts
export type Announcement = {
  id: string;
  title: string;
  content: string; // 🔄 was `body`
  author: string; // 🔄 better than authorRole for UI
  date: string; // 🔄 maps to createdAt
  category?: string; // optional, for tags like "event", "general"
  question: string;
  answer: string;
};
