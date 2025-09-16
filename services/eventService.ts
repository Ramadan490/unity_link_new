// services/eventService.ts
import { Event } from "../types/event";
import { apiFetch } from "../utils/api";

let mockEvents: Event[] = [
  {
    id: "1",
    title: "Cultural Night Gala",
    description: "Join us for an evening of food, music, and community celebration.",
    date: "2025-09-25",
    location: "Community Center, Phoenix",
    createdBy: "Board Member 📝",
    status: "upcoming",
    donations: 1200,
    goal: 2000,
  },
  {
    id: "2",
    title: "Youth Soccer Day",
    description: "A fun sports day for kids and families — come cheer them on!",
    date: "2025-10-05",
    location: "Tempe Soccer Fields",
    createdBy: "Super Admin 🔑",
    status: "upcoming",
    donations: 450,
    goal: 1000,
  },
];

// ✅ GET events
export async function getEvents(): Promise<Event[]> {
  try {
    return await apiFetch<Event[]>("/events");
  } catch {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockEvents), 500)
    );
  }
}

// ✅ ADD event
export async function addEvent(event: Event): Promise<Event> {
  try {
    return await apiFetch<Event>("/events", {
      method: "POST",
      body: JSON.stringify(event),
    });
  } catch {
    const newEvent: Event = {
      ...event,
      id: String(mockEvents.length + 1),
    };
    mockEvents.push(newEvent);
    return new Promise((resolve) =>
      setTimeout(() => resolve(newEvent), 300)
    );
  }
}

// ✅ DELETE event
export async function deleteEvent(id: string): Promise<void> {
  try {
    await apiFetch<void>(`/events/${id}`, { method: "DELETE" });
  } catch {
    mockEvents = mockEvents.filter((e) => e.id !== id);
  }
}
