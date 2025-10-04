// shared/types/user.ts
export type UserRole = "super_admin" | "board_member" | "community_member";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  hashedPassword?: string | null;
  avatar?: string | null;
  phone?: string;
  communityId?: string;
}

export const UserRoles = {
  SUPER_ADMIN: "super_admin" as UserRole,
  BOARD_MEMBER: "board_member" as UserRole,
  COMMUNITY_MEMBER: "community_member" as UserRole,
};
