"use client";
/**
 * AuthContext — quản lý trạng thái đăng nhập toàn cục.
 * Wrap toàn bộ app bằng <AuthProvider> để dùng useAuth() ở bất cứ component nào.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as api from "./api";

interface AuthState {
  user: api.UserResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<void>;
  logout: () => void;
  updateMe: (payload: { full_name?: string | null; password?: string | null }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const parentCtx = useContext(AuthContext);
  const [user, setUser] = useState<api.UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = api.getToken();
    if (!token) return;
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      // ignore
    }
  }, []);

  // Khôi phục session khi reload trang (bỏ qua nếu đã có AuthProvider cha)
  useEffect(() => {
    if (parentCtx) return;
    let active = true;
    const restore = async () => {
      const token = api.getToken();
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const me = await api.getMe();
        if (active) setUser(me);
      } catch {
        api.removeToken();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    void restore();
    return () => {
      active = false;
    };
  }, [parentCtx]);

  const login = useCallback(async (email: string, password: string) => {
    await api.login(email, password);
    const me = await api.getMe();
    setUser(me);
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      await api.register(email, password, fullName);
      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  const updateMe = useCallback(
    async (payload: { full_name?: string | null; password?: string | null }) => {
      const updated = await api.updateMe(payload);
      setUser(updated);
    },
    [],
  );

  if (parentCtx) {
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateMe, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
