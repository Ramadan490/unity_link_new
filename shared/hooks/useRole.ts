// shared/hooks/useRole.ts
import { useAuth } from "@/shared/context/AuthContext";
import { UserRole } from "@/shared/types/user";

export const useRole = () => {
  const { user, role } = useAuth();

  // ✅ Ensure we always get a proper UserRole (fallback to "community_member")
  const userRole: UserRole = (role ||
    user?.role ||
    "community_member") as UserRole;

  // ✅ Check against normalized role values
  const isSuperAdmin = userRole === "super_admin";
  const isBoardMember = userRole === "board_member";
  const isCommunityMember = userRole === "community_member";

  return {
    user,
    isSuperAdmin,
    isBoardMember,
    isCommunityMember,
    currentRole: userRole,
  };
};
