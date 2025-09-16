import {
  loadUserFromStorage,
  loginUser,
  logoutUser,
  registerUser,
} from "@/services"; // ✅ adjust if needed
import { User } from "@/types/user";
import React, { createContext, useContext, useEffect, useState } from "react";

export type RoleKey = "super_admin" | "board_member" | "community_member" | "member";

export type AuthContextType = {
  user: User | null;
  role: RoleKey;
  loading: boolean;
  login: (credential: string, password: string) => Promise<void>;
  register: (credential: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: RoleKey) => void; // ✅ so tabs can update role
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<RoleKey>("member");

  // Load session from storage at startup
  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = await loadUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
          setRole((storedUser.role as RoleKey) || "member");
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (credential: string, password: string) => {
    try {
      const loggedIn = await loginUser(credential, password);
      setUser(loggedIn);
      setRole((loggedIn.role as RoleKey) || "member");
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to let components handle the error
    }
  };

  const register = async (credential: string, password: string) => {
    try {
      const newUser = await registerUser(credential, password);
      setUser(newUser);
      setRole((newUser.role as RoleKey) || "member");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error; // Re-throw to let components handle the error
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setRole("member");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error; // Re-throw to let components handle the error
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, login, register, logout, setRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Named export so other files can import it
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

// ✅ Default export for the context itself
export default AuthContext;