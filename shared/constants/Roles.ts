// shared/constants/Roles.ts
import { UserRole } from "@/shared/types/user";

// Use UserRole consistently everywhere
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  board_member: "Board Member",
  community_member: "Community Member",
};

// ✅ Order for sorting
export const ROLE_ORDER: Record<UserRole, number> = {
  super_admin: 0,
  board_member: 1,
  community_member: 2,
};
