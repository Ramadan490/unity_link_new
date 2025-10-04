// features/requests/services/requestService.ts
import { apiFetch } from "@/shared/utils/api";
import { Request } from "@/types/request";

// ✅ REMOVED: const API_URL = "/api";

export async function getRequests(): Promise<Request[]> {
  // ✅ FIXED: Remove /api prefix
  return apiFetch(`/requests`);
}

export async function createRequest(data: {
  title: string;
  description: string;
  status: string;
  communityId: string;
  createdById: string;
}): Promise<Request> {
  // ✅ FIXED: Remove /api prefix
  return apiFetch(`/requests`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteRequest(id: string): Promise<void> {
  // ✅ FIXED: Remove /api prefix
  return apiFetch(`/requests/${id}`, {
    method: "DELETE",
  });
}

export async function addReply(
  requestId: string,
  data: {
    content: string;
    createdById: string;
  }
): Promise<any> {
  // ✅ FIXED: Remove /api prefix
  return apiFetch(`/requests/${requestId}/replies`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
