// shared/hooks/useRoleManagement.ts
import { User, UserRole } from "@/shared/types/user"; // ✅ import your shared type
import { useEffect, useState } from "react";

// Simple mock implementation
const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@community.com",
    role: "super_admin",
  },
  {
    id: "2",
    name: "Board Member 1",
    email: "board1@community.com",
    role: "board_member",
  },
  {
    id: "3",
    name: "Board Member 2",
    email: "board2@community.com",
    role: "board_member",
  },
  {
    id: "4",
    name: "Community Member 1",
    email: "member1@community.com",
    role: "community_member",
  },
  {
    id: "5",
    name: "Community Member 2",
    email: "member2@community.com",
    role: "community_member",
  },
];

const mockApi = {
  getUsers: (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockUsers]);
      }, 500);
    });
  },

  updateUserRole: (id: string, newRole: UserRole): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = mockUsers.findIndex((user) => user.id === id);
        if (userIndex !== -1) {
          mockUsers[userIndex] = { ...mockUsers[userIndex], role: newRole };
          resolve(mockUsers[userIndex]);
        } else {
          reject(new Error("User not found"));
        }
      }, 300);
    });
  },
};

export const useRoleManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await mockApi.getUsers();
      console.log("Fetched users:", usersData);
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRoleHandler = async (id: string, newRole: UserRole) => {
    try {
      setError(null);
      console.log("Updating user role:", { id, newRole });

      const updated = await mockApi.updateUserRole(id, newRole);
      console.log("Update response:", updated);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, role: updated.role } : user,
        ),
      );

      return updated;
    } catch (err: any) {
      console.error("Failed to update user role:", err);
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
