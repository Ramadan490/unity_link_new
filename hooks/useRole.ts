// hooks/useRole.ts
import { useAuth } from '@/context/AuthContext';

export const useRole = () => {
  const { user, role } = useAuth();
  
  const isSuperAdmin = role === 'super_admin';
  const isBoardMember = role === 'board_member' || isSuperAdmin;
  const isCommunityMember = role === 'community_member' || isBoardMember;
  const isMember = role === 'member' || isCommunityMember;

  return {
    isSuperAdmin,
    isBoardMember,
    isCommunityMember,
    isMember,
    role,
    user, // Now this will work since we added user to AuthContext
  };
};