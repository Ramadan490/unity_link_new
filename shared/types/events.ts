export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  createdBy: string;
  status: "upcoming" | "past" | "cancelled";
  donations: number;
  goal: number;
};
