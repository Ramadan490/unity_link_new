// features/events/services/eventService.ts
import { Event } from "@/shared/types/events";
import { apiFetch } from "@/shared/utils/api"; // ✅ correct path

let mockEvents: Event[] = [
  {
    id: "1",
    title: "Cultural Night Gala",
    description:
      "Join us for an evening of food, music, and community celebration.",
    date: "2025-09-25",
    location: "Community Center, Phoenix",
    createdBy: "Board Member 📝",
    status: "upcoming",
    donations: 1200,
    goal: 2000,
    attending: ["u1", "u2"], // ✅ example attendees
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
    attending: [], // ✅ empty initially
  },
];

// ✅ GET events
export async function getEvents(): Promise<Event[]> {
  try {
    return await apiFetch<Event[]>("/events");
  } catch {
    return new Promise((resolve) => setTimeout(() => resolve(mockEvents), 500));
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
      attending: [],
    };
    mockEvents.push(newEvent);
    return new Promise((resolve) => setTimeout(() => resolve(newEvent), 300));
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

// ✅ RSVP / Cancel RSVP
export async function toggleRSVP(
  eventId: string,
  userId: string,
): Promise<Event | null> {
  try {
    // If backend exists
    return await apiFetch<Event>(`/events/${eventId}/rsvp`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  } catch {
    // Fallback mock logic
    mockEvents = mockEvents.map((event) =>
      event.id === eventId
        ? {
            ...event,
            attending: event.attending.includes(userId)
              ? event.attending.filter((id) => id !== userId) // cancel RSVP
              : [...event.attending, userId], // add RSVP
          }
        : event,
    );

    return mockEvents.find((e) => e.id === eventId) || null;
  }
}
