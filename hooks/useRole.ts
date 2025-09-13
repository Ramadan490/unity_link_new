
import { useEffect, useState } from 'react';
import { RoleKey } from '../constants/Roles';
import { getUsers, updateUserRole as serviceUpdateUserRole } from '../services/userService';
import { User } from '../types/user';


export function useRole() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => {
      const allUsers = await getUsers();
      setUsers(allUsers);
      
      if (!user) setUser(allUsers[0]);
    };
    load();
  }, []);

const updateUserRole = async (id: string, newRole: RoleKey) => {    try {
      const updated = await serviceUpdateUserRole(id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u))
      );
      if (user?.id === id) setUser({ ...user, role: updated.role });
    } catch (err) {
      console.error('⚠️ Failed to update user role:', err);
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isBoardMember = user?.role === 'board_member';
  const isCommunityMember = user?.role === 'community_member';

  return {
    user,
    users,
    setUsers, 
    updateUserRole,
    isSuperAdmin,
    isBoardMember,
    isCommunityMember,
  };
}
