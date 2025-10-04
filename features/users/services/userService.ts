// features/users/services/userService.ts
import { User } from "@/shared/types/user";
import { apiFetch } from "@/shared/utils/api";
import { Storage } from "@/shared/utils/storage";

export async function getUsers(): Promise<User[]> {
  return apiFetch(`/users`);
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<User> {
  return apiFetch(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  return apiFetch(`/users/${userId}`, {
    method: "DELETE",
  });
}

// 🔐 Authentication functions
export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  const response = await apiFetch<{ user: User; token: string }>(
    `/auth/login`,
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );

  if (response.token) {
    await Storage.setAuthToken(response.token);
  }

  return response.user;
}

export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const response = await apiFetch<{ user: User; token: string }>(
    `/auth/register`,
    {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }
  );

  if (response.token) {
    await Storage.setAuthToken(response.token);
  }

  return response.user;
}

export async function logoutUser(): Promise<void> {
  await Storage.removeAuthToken();
}

// Get current user profile
export async function getCurrentUser(): Promise<User> {
  return apiFetch(`/auth/me`);
}
