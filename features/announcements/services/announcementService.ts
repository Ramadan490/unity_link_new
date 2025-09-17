import { Announcement } from "@/types/announcement";
import { apiFetch } from "@/utils/api";

let mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Holiday Notice",
    content: "Office closed on 15th Sep.",
    author: "Board Member 📝",
    date: new Date().toISOString(),
    category: "General",
    question: "When is the office closed?", // ✅ added
    answer: "On 15th September.", // ✅ added
  },
  {
    id: "2",
    title: "Meeting",
    content: "Board meeting at 10 AM tomorrow.",
    author: "Super Admin 🔑",
    date: new Date().toISOString(),
    category: "Board",
    question: "What time is the meeting?", // ✅ added
    answer: "10 AM tomorrow.", // ✅ added
  },
];

// ✅ GET announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    return await apiFetch<Announcement[]>("/announcements");
  } catch {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockAnnouncements), 500),
    );
  }
}

// ✅ ADD announcement
export async function addAnnouncement(
  announcement: Omit<Announcement, "id" | "createdAt">,
): Promise<Announcement> {
  try {
    return await apiFetch<Announcement>("/announcements", {
      method: "POST",
      body: JSON.stringify(announcement),
    });
  } catch {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: String(mockAnnouncements.length + 1),
      date: new Date().toISOString(), // ✅ matches your type
    };

    mockAnnouncements.push(newAnnouncement);
    return new Promise((resolve) =>
      setTimeout(() => resolve(newAnnouncement), 300),
    );
  }
}

// ✅ DELETE announcement
export async function deleteAnnouncement(id: string): Promise<void> {
  try {
    await apiFetch<void>(`/announcements/${id}`, { method: "DELETE" });
  } catch {
    mockAnnouncements = mockAnnouncements.filter((a) => a.id !== id);
  }
}
