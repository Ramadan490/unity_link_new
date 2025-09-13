// types/event.ts
export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  status?: string;
  createdBy?: string;
  goal?: number;
  donations?: number;
};
