import { RoleKey } from "@/shared/constants/Roles";
import { User } from "@/shared/types/user";
import { apiFetch } from "@/shared/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---- Mock fallback users ----
let mockUsers: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "community_member" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "board_member" },
  { id: "3", name: "Charlie", email: "charlie@example.com", role: "super_admin" },
];

// ---- Storage Key ----
const STORAGE_KEY = "currentUser";

// ---- Storage Helpers ----
export async function saveUserToStorage(user: User | null): Promise<void> {
  try {
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error("❌ Failed to save user:", err);
  }
}

export async function clearUserFromStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("❌ Failed to clear user:", err);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : null;
}

export async function loadUserFromStorage(): Promise<User | null> {
  return await getCurrentUser();
}

// ---- Auth Actions ----
export async function loginUser(name: string, password: string): Promise<User> {
  try {
    // 🔗 Real backend: POST login
    const loggedIn = await apiFetch<User>("/login", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    });
    await saveUserToStorage(loggedIn);
    return loggedIn;
  } catch {
    // Mock fallback
    let user = mockUsers.find((u) => u.name === name);
    if (!user) {
      user = {
        id: String(mockUsers.length + 1),
        name,
        email: `${name.toLowerCase()}@example.com`,
        role: "community_member",
      };
      mockUsers.push(user);
    }
    await saveUserToStorage(user);
    return user;
  }
}

export async function registerUser(name: string, password: string): Promise<User> {
  try {
    const newUser = await apiFetch<User>("/register", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    });
    await saveUserToStorage(newUser);
    return newUser;
  } catch {
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      email: `${name.toLowerCase()}@example.com`,
      role: "community_member",
    };
    mockUsers.push(newUser);
    await saveUserToStorage(newUser);
    return newUser;
  }
}

export async function logoutUser(): Promise<void> {
  await clearUserFromStorage();
}

// ---- User Management ----
export async function getUsers(): Promise<User[]> {
  try {
    return await apiFetch<User[]>("/users");
  } catch {
    return new Promise((resolve) => setTimeout(() => resolve(mockUsers), 500));
  }
}

export async function updateUserRole(userId: string, role: RoleKey): Promise<User> {
  try {
    const updated = await apiFetch<User>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    await saveUserToStorage(updated);
    return updated;
  } catch {
    mockUsers = mockUsers.map((u) => (u.id === userId ? { ...u, role } : u));
    const updatedUser = mockUsers.find((u) => u.id === userId)!;
    await saveUserToStorage(updatedUser);
    return new Promise((resolve) =>
      setTimeout(() => resolve(updatedUser), 300)
    );
  }
}
