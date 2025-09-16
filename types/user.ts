import { ROLE_LABELS } from '../constants/Roles';

// All role keys
export type RoleKey = keyof typeof ROLE_LABELS;

export type User = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "super_admin" | "board_member" | "community_member" | "member";
  avatar?: string;
};
