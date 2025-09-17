// constants/Roles.ts
export const ROLE_LABELS = {
  super_admin: "Super Admin ",
  board_member: "Board Member ",
  community_member: "Community Member ",
} as const;

export type RoleKey = keyof typeof ROLE_LABELS;
