export type User = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "board_member" | "community_member";
  avatar?: string; // ✅ optional so profile page works
};
