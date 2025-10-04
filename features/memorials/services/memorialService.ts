// features/memorials/services/memorialService.ts
import { apiFetch } from "@/shared/utils/api";
import { Memorial } from "@/types/memorial";

// ✅ REMOVED: const API_URL = "/api";

export const getMemorials = async (): Promise<Memorial[]> => {
  // ✅ FIXED: Remove /api prefix
  return apiFetch(`/memorials`);
};

export const addMemorial = async (data: {
  name: string;
  description: string;
  communityId: string;
  createdById: string;
}): Promise<Memorial> => {
  // ✅ FIXED: Remove /api prefix
  return apiFetch(`/memorials`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const deleteMemorial = async (id: string): Promise<void> => {
  // ✅ FIXED: Remove /api prefix
  return apiFetch(`/memorials/${id}`, {
    method: "DELETE",
  });
};
