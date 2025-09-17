// /types/request.ts

export type Reply = {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
};

export type Request = {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  createdBy: string;
  createdAt: string; // ✅ now official field
  replies: Reply[]; // ✅ always array
};
