import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  loadUserFromStorage,
  loginUser,
  logoutUser,
  registerUser,
} from '../services';
import { User } from '../types/user';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (credential: string, password: string) => Promise<void>;
  register: (credential: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from storage at startup
  useEffect(() => {
    const init = async () => {
      const storedUser = await loadUserFromStorage();
      if (storedUser) setUser(storedUser);
      setLoading(false);
    };
    init();
  }, []);

  // ---- Auth Actions ----
  const login = async (credential: string, password: string) => {
    const loggedIn = await loginUser(credential, password);
    setUser(loggedIn);
  };

  const register = async (credential: string, password: string) => {
    const newUser = await registerUser(credential, password);
    setUser(newUser);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
