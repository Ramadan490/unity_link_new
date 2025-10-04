// shared/utils/userMapper.ts
import { User, UserRole } from "@/shared/types/user";

export interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "super_admin" | "board_member" | "community_member";
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
  communityId?: string;
}

// 🔹 Convert UserData (storage/API) → User (app model)
export const mapUserDataToUser = (data: UserData): User => {
  return {
    id: data.id,
    email: data.email,
    name:
      [data.firstName, data.lastName].filter(Boolean).join(" ") || undefined,
    role: data.role as UserRole,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
    avatar: data.avatar ?? null,
  };
};

// 🔹 Convert User (app model) → UserData (for storage/API)
export const mapUserToUserData = (user: User): UserData => {
  const [firstName, ...rest] = (user.name ?? "").split(" ");
  const lastName = rest.join(" ").trim();

  return {
    id: user.id,
    email: user.email,
    firstName: firstName || "",
    lastName: lastName || "",
    role: user.role,
    avatar: user.avatar ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
