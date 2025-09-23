// context/AuthContext.tsx
import {
  loadUserFromStorage,
  saveUserToStorage, // ✅ added
  loginUser,
  logoutUser,
  registerUser,
} from "@/features/users/services/userService";
import { User } from "@/types/user";
import React, { createContext, useContext, useEffect, useState } from "react";

// Only valid roles
export type RoleKey = "super_admin" | "board_member" | "community_member";

export type AuthContextType = {
  user: User | null;
  role: RoleKey | null;
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  login: (credential: string, password: string) => Promise<void>;
  register: (credential: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: RoleKey) => void;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRoleState] = useState<RoleKey | null>(null);

  const clearError = () => setError(null);

  // Load session from storage at startup
  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = await loadUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
          setRoleState(storedUser.role as RoleKey);
        } else {
          setRoleState(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load user session",
        );
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (credential: string, password: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      const loggedIn = await loginUser(credential, password);
      setUser(loggedIn);
      setRoleState(loggedIn.role as RoleKey);
      await saveUserToStorage(loggedIn); // ✅ persist
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (credential: string, password: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      const newUser = await registerUser(credential, password);
      setUser(newUser);
      setRoleState(newUser.role as RoleKey);
      await saveUserToStorage(newUser); // ✅ persist
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setRoleState(null);
      setError(null);
      await saveUserToStorage(null); // ✅ clear storage
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const setRole = (newRole: RoleKey) => {
    setRoleState(newRole);
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      saveUserToStorage(updated); // ✅ persist
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    saveUserToStorage(updated); // ✅ persist
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        authLoading,
        error,
        login,
        register,
        logout,
        setRole,
        clearError,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
