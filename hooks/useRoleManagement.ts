// hooks/useRoleManagement.ts
import { RoleKey } from "@/constants/Roles";
import {
  getUsers,
  updateUserRole as serviceUpdateUserRole,
} from "@/services/userService";
import { User } from "@/types/user";
import { useCallback, useEffect, useState } from "react";

export function useRoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allUsers = await getUsers();
      setUsers(allUsers);
    } catch (err: any) {
      console.error("⚠️ Failed to load users:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (id: string, newRole: RoleKey) => {
    try {
      const updated = await serviceUpdateUserRole(id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u))
      );
      return updated;
    } catch (err: any) {
      console.error("⚠️ Failed to update user role:", err);
      setError(err.message || "Failed to update user role");
      throw err;
    }
  };

  return { users, loading, error, updateUserRole, refetch: fetchUsers };
}
