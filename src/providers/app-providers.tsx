"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api, googleLoginUrl, type User } from "@/lib/api";

type Credentials = { email: string; password: string };
type RegisterInput = Credentials & { name: string };
type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (input: Credentials) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const protectedPrefixes = ["/workspace", "/items/add", "/items/manage", "/dashboard", "/profile", "/admin"];
const authPaths = new Set(["/login", "/register"]);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
  }));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await api<{ user: User | null }>("/api/auth/me");
      setUser(result.user);
    } catch {
      setUser(null);
      await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const protectedPath = protectedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const authPath = authPaths.has(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && protectedPath) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    if (user && authPath) router.replace("/workspace");
  }, [authPath, loading, pathname, protectedPath, router, user]);

  const login = useCallback(async (input: Credentials) => {
    const result = await api<{ user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify(input) });
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await api<{ user: User }>("/api/auth/register", { method: "POST", body: JSON.stringify(input) });
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(() => ({ user, loading, login, register, logout, refresh, loginWithGoogle: () => { window.location.href = googleLoginUrl; } }), [user, loading, login, register, logout, refresh]);
  const checkingOrRedirecting = (loading && (protectedPath || authPath)) || (!loading && ((!user && protectedPath) || (user && authPath)));
  const content = checkingOrRedirecting
    ? <div className="shell grid min-h-[calc(100svh-64px)] place-items-center py-10"><p className="text-sm font-semibold text-slate-500">Checking your session…</p></div>
    : children;
  return <QueryClientProvider client={queryClient}><AuthContext.Provider value={value}>{content}<ToastContainer position="bottom-right" autoClose={5000} limit={3} newestOnTop closeOnClick pauseOnFocusLoss pauseOnHover theme="light"/></AuthContext.Provider></QueryClientProvider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AppProviders");
  return value;
}
