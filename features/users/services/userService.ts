import { RoleKey } from "@/constants/Roles";
import { User } from "@/types/user";
import { apiFetch } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Mock fallback users
let mockUsers: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "community_member" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "board_member" },
  { id: "3", name: "Charlie", email: "charlie@example.com", role: "super_admin" },
];

// ---- Storage Keys ----
const STORAGE_KEY = "currentUser";

// ---- Auth Helpers ----
export async function getCurrentUser(): Promise<User | null> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : null;
}

export async function loadUserFromStorage(): Promise<User | null> {
  return await getCurrentUser();
}

export async function loginUser(name: string, password: string): Promise<User> {
  try {
    // 🔗 Real backend: POST login
    return await apiFetch<User>("/login", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    });
  } catch {
    // Mock fallback: find user or create one
    let user = mockUsers.find((u) => u.name === name);
    if (!user) {
      user = {
        id: String(mockUsers.length + 1),
        name,
        email: `${name.toLowerCase()}@example.com`, // ✅ add email
        role: "community_member",
      };
      mockUsers.push(user);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
}

export async function registerUser(
  name: string,
  password: string,
): Promise<User> {
  try {
    return await apiFetch<User>("/register", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    });
  } catch {
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      email: `${name.toLowerCase()}@example.com`, // ✅ add email
      role: "community_member",
    };
    mockUsers.push(newUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  }
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

// ---- User Management ----
export async function getUsers(): Promise<User[]> {
  try {
    return await apiFetch<User[]>("/users");
  } catch {
    return new Promise((resolve) => setTimeout(() => resolve(mockUsers), 500));
  }
}

export async function updateUserRole(
  userId: string,
  role: RoleKey,
): Promise<User> {
  try {
    return await apiFetch<User>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  } catch {
    mockUsers = mockUsers.map((u) => (u.id === userId ? { ...u, role } : u));
    const updatedUser = mockUsers.find((u) => u.id === userId)!;
    return new Promise((resolve) =>
      setTimeout(() => resolve(updatedUser), 300),
    );
  }
}
