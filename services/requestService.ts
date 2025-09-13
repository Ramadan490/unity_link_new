import { Request } from '../types/request';
import { apiFetch } from '../utils/api';

let mockRequests: Request[] = [
  {
    id: '1',
    title: 'Fix street light',
    description: 'Light out near park',
    status: 'open',
    createdBy: 'Community Member 👥', // ✅ added
    date: '2025-09-11',              // ✅ added (optional but useful)
  },
  {
    id: '2',
    title: 'Noise complaint',
    description: 'Late night music',
    status: 'in_progress',
    createdBy: 'Board Member 📝', // ✅ added
    date: '2025-09-10',
  },
];

// GET requests
export async function getRequests(): Promise<Request[]> {
  try {
    return await apiFetch<Request[]>('/requests');
  } catch {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockRequests), 500)
    );
  }
}

// ADD request
export async function addRequest(request: Request): Promise<Request> {
  try {
    return await apiFetch<Request>('/requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  } catch {
    const newRequest = {
      ...request,
      id: String(mockRequests.length + 1),
      createdBy: request.createdBy ?? 'Community Member 👥', // fallback
      date: request.date ?? new Date().toISOString().split('T')[0], // fallback
    };
    mockRequests.push(newRequest);
    return new Promise((resolve) =>
      setTimeout(() => resolve(newRequest), 300)
    );
  }
}

// DELETE request
export async function deleteRequest(id: string): Promise<void> {
  try {
    await apiFetch<void>(`/requests/${id}`, { method: 'DELETE' });
  } catch {
    mockRequests = mockRequests.filter((r) => r.id !== id);
  }
}
