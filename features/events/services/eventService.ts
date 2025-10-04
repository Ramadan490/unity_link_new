// features/events/services/eventService.ts
import { Event } from "@/shared/types/events";
import { apiFetch } from "@/shared/utils/api";

// ✅ REMOVED: const API_URL = "/api";

// Get all events for a community
export async function getEvents(communityId: string): Promise<Event[]> {
  // ✅ FIXED: Remove /api prefix
  return apiFetch<Event[]>(`/events?communityId=${communityId}`);
}

// Create new event
export async function createEvent(
  communityId: string,
  data: {
    title: string;
    date: string;
    location: string;
    description?: string;
    createdById: string;
  }
): Promise<Event> {
  // ✅ FIXED: Remove /api prefix
  return apiFetch<Event>(`/events`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Delete event
export async function deleteEvent(id: string): Promise<void> {
  // ✅ FIXED: Remove /api prefix
  return apiFetch<void>(`/events/${id}`, {
    method: "DELETE",
  });
}
