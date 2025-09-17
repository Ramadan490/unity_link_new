import { Memorial } from "@/types/memorial";
import { apiFetch } from "@/utils/api";
let mockMemorials: Memorial[] = [
  {
    id: "1",
    name: "Ahmed Ali",
    description: "Beloved father and husband.",
    createdAt: "2025-09-01",
    createdBy: "Community Member",
  },
  {
    id: "2",
    name: "Fatima Hassan",
    description: "She will be deeply missed.",
    createdAt: "2025-08-15",
    createdBy: "Board Member",
  },
];

// GET
export async function getMemorials(): Promise<Memorial[]> {
  try {
    return await apiFetch<Memorial[]>("/memorials");
  } catch {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockMemorials), 500),
    );
  }
}

// ADD
export async function addMemorial(memorial: Memorial): Promise<Memorial> {
  try {
    return await apiFetch<Memorial>("/memorials", {
      method: "POST",
      body: JSON.stringify(memorial),
    });
  } catch {
    const newMemorial = { ...memorial, id: String(mockMemorials.length + 1) };
    mockMemorials.push(newMemorial);
    return new Promise((resolve) =>
      setTimeout(() => resolve(newMemorial), 300),
    );
  }
}

// DELETE
export async function deleteMemorial(id: string): Promise<void> {
  try {
    await apiFetch<void>(`/memorials/${id}`, { method: "DELETE" });
  } catch {
    mockMemorials = mockMemorials.filter((m) => m.id !== id);
  }
}
