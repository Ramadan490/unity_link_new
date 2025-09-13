// types/request.ts

export interface Request {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed'; // ✅ stricter typing
  createdBy: string; // ✅ who made the request
  date?: string; // ✅ optional (ISO date string: "2025-09-11")
}
