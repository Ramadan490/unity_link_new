// useRoleManagement.ts - FIXED
import { User, UserRole, UserRoles } from "@/shared/types/user";
import { apiFetch } from "@/shared/utils/api";
import { useEffect, useState } from "react";

export const useRoleManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeRole = (role: string): UserRole => {
    switch (role) {
      case "super_admin":
        return UserRoles.SUPER_ADMIN;
      case "board_member":
        return UserRoles.BOARD_MEMBER;
      case "community_member":
        return UserRoles.COMMUNITY_MEMBER;
      default:
        return UserRoles.COMMUNITY_MEMBER;
    }
  };

  // Fetch users - FIXED: removed /api prefix
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching users...");
      const usersData = await apiFetch<User[]>("/users"); // ← Changed from "/api/users" to "/users"
      console.log("✅ API Users:", usersData);

      const normalized = usersData.map((u) => ({
        ...u,
        role: normalizeRole(u.role),
      }));

      setUsers(normalized);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Update role - FIXED: removed /api prefix
  const updateUserRoleHandler = async (id: string, newRole: UserRole) => {
    try {
      setError(null);
      console.log("Updating role:", { id, newRole });

      const updated = await apiFetch<User>(`/users/${id}`, {
        // ← Changed from "/api/users/${id}" to "/users/${id}"
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });

      console.log("✅ Role update response:", updated);

      const updatedUser = { ...updated, role: normalizeRole(updated.role) };
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );

      return updatedUser;
    } catch (err: any) {
      console.error("❌ Failed to update user role:", err);
      setError(err.message || "Failed to update user role");
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    updateUserRole: updateUserRoleHandler,
    loading,
    error,
    refetch: fetchUsers,
  };
};
