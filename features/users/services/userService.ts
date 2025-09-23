import { User, UserRole } from "@/shared/types/user";
import { apiFetch } from "@/shared/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---- Role Normalization ----
const roleMap: Record<string, UserRole> = {
  superadmin: "super_admin",
  super_admin: "super_admin",
  board: "board_member",
  board_member: "board_member",
  member: "community_member",
  community_member: "community_member",
};

// Raw API response type (unknown structure)
type RawUser = {
  id?: string | number;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
};

function normalizeUser(raw: RawUser): User {
  return {
    id: String(raw.id ?? Date.now()),
    name: raw.name ?? "Unknown",
    email: raw.email ?? `${(raw.name || "user").toLowerCase()}@example.com`,
    avatar: raw.avatar ?? "",
    role: roleMap[raw.role ?? ""] || "community_member",
  };
}

// ---- Mock fallback users ----
let mockUsers: User[] = [
  {
    id: "1",
    name: "Alice",
    email: "alice@example.com",
    role: "community_member",
  },
  { id: "2", name: "Bob", email: "bob@example.com", role: "board_member" },
  {
    id: "3",
    name: "Charlie",
    email: "charlie@example.com",
    role: "super_admin",
  },
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
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? (JSON.parse(json) as User) : null;
  } catch {
    return null;
  }
}

export async function loadUserFromStorage(): Promise<User | null> {
  return await getCurrentUser();
}

// ---- Auth Actions ----
export async function loginUser(name: string, password: string): Promise<User> {
  try {
    const loggedIn: RawUser = await apiFetch<RawUser>("/login", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    });
    const normalized = normalizeUser(loggedIn);
    await saveUserToStorage(normalized);
    return normalized;
  } catch {
    // fallback to mock
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

export async function registerUser(
  name: string,
  password: string,
): Promise<User> {
  try {
    const newUser: RawUser = await apiFetch<RawUser>("/register", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    });
    const normalized = normalizeUser(newUser);
    await saveUserToStorage(normalized);
    return normalized;
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
    const raw: RawUser[] = await apiFetch<RawUser[]>("/users");
    return raw.map(normalizeUser);
  } catch {
    return new Promise((resolve) => setTimeout(() => resolve(mockUsers), 500));
  }
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<User> {
  try {
    const updated: RawUser = await apiFetch<RawUser>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    const normalized = normalizeUser(updated);

    const current = await getCurrentUser();
    if (current?.id === normalized.id) {
      await saveUserToStorage(normalized);
    }

    return normalized;
  } catch {
    mockUsers = mockUsers.map((u) => (u.id === userId ? { ...u, role } : u));
    const updatedUser = mockUsers.find((u) => u.id === userId)!;

    const current = await getCurrentUser();
    if (current?.id === updatedUser.id) {
      await saveUserToStorage(updatedUser);
    }

    return new Promise((resolve) =>
      setTimeout(() => resolve(updatedUser), 300),
    );
  }
}
