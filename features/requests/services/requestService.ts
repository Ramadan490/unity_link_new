// features/requests/services/requestService.ts
import { Request } from "@/types/request"; // ✅ fixed path
import { apiFetch } from "@/utils/api"; // ✅ fixed path

let mockRequests: Request[] = [
  {
    id: "1",
    title: "Fix street light",
    description: "Light out near park",
    status: "open",
    createdBy: "Community Member 👥",
    createdAt: "2025-09-11",
    replies: [],
  },
  {
    id: "2",
    title: "Noise complaint",
    description: "Late night music",
    status: "in_progress",
    createdBy: "Board Member 📝",
    createdAt: "2025-09-10",
    replies: [],
  },
];

// ✅ GET requests
export async function getRequests(): Promise<Request[]> {
  try {
    return await apiFetch<Request[]>("/requests");
  } catch {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockRequests), 500),
    );
  }
}

// ✅ ADD request
export async function addRequest(
  request: Omit<Request, "id" | "createdAt">,
): Promise<Request> {
  try {
    return await apiFetch<Request>("/requests", {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch {
    const newRequest: Request = {
      ...request,
      id: String(mockRequests.length + 1),
      createdAt: new Date().toISOString().split("T")[0],
      replies: [],
    };
    mockRequests.push(newRequest);
    return new Promise((resolve) => setTimeout(() => resolve(newRequest), 300));
  }
}

// ✅ DELETE request
export async function deleteRequest(id: string): Promise<void> {
  try {
    await apiFetch<void>(`/requests/${id}`, { method: "DELETE" });
  } catch {
    mockRequests = mockRequests.filter((r) => r.id !== id);
  }
}
