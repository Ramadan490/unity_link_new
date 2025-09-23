export type Announcement = {
  id: string;
  title: string;
  content: string; // was body
  author: string; // was authorRole
  date: string; // was createdAt
  category?: string;
  question?: string;
  answer?: string;
};
