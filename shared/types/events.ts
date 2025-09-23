// shared/types/events.ts
export type Event = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  location: string;
  createdBy: string;
  status: "upcoming" | "past" | "cancelled";
  donations: number;
  goal: number;
  attending: string[]; // 👈 store user IDs of attendees
};
