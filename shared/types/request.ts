// types/request.ts
export type Reply = {
  id: string;
  content: string; // Changed from 'text' to 'content'
  createdBy: string;
  createdAt: string;
};

export type Request = {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  createdBy: string;
  createdAt: string;
  replies: Reply[];
};
