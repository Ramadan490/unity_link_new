// features/announcements/services/announcementService.ts
import { Announcement } from "@/shared/types/announcement";
import { apiFetch } from "@/shared/utils/api";

// ✅ REMOVED: const API_URL = "/api";

export const getAnnouncements = async (
  communityId: string
): Promise<Announcement[]> => {
  // ✅ FIXED: Remove /api prefix since it's already in the base URL
  return apiFetch(`/announcements?communityId=${communityId}`);
};

export const createAnnouncement = async (data: {
  title: string;
  content: string;
  communityId: string;
  createdById: string;
  priority?: "normal" | "high";
}): Promise<Announcement> => {
  // ✅ FIXED: Remove /api prefix
  return apiFetch(`/announcements`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  // ✅ FIXED: Remove /api prefix
  return apiFetch(`/announcements/${id}`, {
    method: "DELETE",
  });
};
