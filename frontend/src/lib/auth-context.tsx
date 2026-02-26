"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { LoginCredentials, RegisterData, User } from "./types";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  refreshAccessToken,
  setAccessToken,
} from "./api";
import { queryClient } from "./query-client";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session on mount via refresh token cookie
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const tokens = await refreshAccessToken();
        if (!cancelled) {
          setUser(tokens.user);
        }
      } catch {
        // No valid refresh cookie — user is not logged in
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const tokens = await apiLogin(credentials);
    setUser(tokens.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const tokens = await apiRegister(data);
    setUser(tokens.user);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    queryClient.clear();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
