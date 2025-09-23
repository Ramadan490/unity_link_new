// shared/types/user.ts
export type UserRole = "super_admin" | "board_member" | "community_member";

export type RoleKey = UserRole;
export interface User {
  id: string;
  name: string;
  email: string; // REQUIRED now
  role: UserRole;
  avatar?: string;
  createdAt?: string;
  lastActive?: string;
}
