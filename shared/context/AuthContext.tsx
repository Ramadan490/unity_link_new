// shared/context/AuthContext.tsx
import {
  loginUser,
  logoutUser,
  registerUser,
} from "@/features/users/services/userService";
import { User, UserRole } from "@/shared/types/user";
import { Storage } from "@/shared/utils/storage";
import {
  mapUserDataToUser,
  mapUserToUserData,
} from "@/shared/utils/userMapper";
import React, { createContext, useContext, useEffect, useState } from "react";

// 🔹 AuthContext type
export type AuthContextType = {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
};

// 🔹 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);

  const clearError = () => setError(null);

  // Load session from storage at startup
  useEffect(() => {
    const init = async () => {
      try {
        const stored = await Storage.getUserData();
        if (stored) {
          const restoredUser = mapUserDataToUser(stored);
          setUser(restoredUser);
          setRoleState(restoredUser.role);
        } else {
          setRoleState(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load user session"
        );
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      const loggedIn = await loginUser(email, password);
      setUser(loggedIn);
      setRoleState(loggedIn.role);
      await Storage.setUserData(mapUserToUserData(loggedIn));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      const newUser = await registerUser(email, password, name);
      setUser(newUser);
      setRoleState(newUser.role);
      await Storage.setUserData(mapUserToUserData(newUser));
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
      await Storage.clearAll();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      Storage.setUserData(mapUserToUserData(updated));
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    Storage.setUserData(mapUserToUserData(updated));
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

// 🔹 Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export { AuthContext };
