// hooks/useRole.ts
import { RoleKey, useAuth } from "@/shared/context/AuthContext";
import { User } from "@/shared/types/user";

export const useRole = () => {
  const { user, role, setRole } = useAuth();

  // Mock data for users - replace with actual API call
  const users: User[] = [
    // Your users data here
  ];

  const updateUserRole = async (userId: string, newRole: RoleKey) => {
    // Implement your role update logic here
    console.log(`Updating user ${userId} to role ${newRole}`);
    // await updateUserRoleAPI(userId, newRole);
  };

  return {
    isSuperAdmin: role === "super_admin",
    isBoardMember: role === "board_member",
    isCommunityMember: role === "community_member",
    isMember: role === "member",
    role,
    user,
    users, // Add this
    updateUserRole, // Add this
  };
};
