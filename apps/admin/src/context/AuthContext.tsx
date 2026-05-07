import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

interface AuthContextValue {
  user: { id: string; email: string; full_name: string; role: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me").then(({ data }) => {
      if (data.role !== "admin") { localStorage.clear(); setLoading(false); return; }
      setUser(data);
    }).catch(() => localStorage.clear()).finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    const me = await api.get("/auth/me");
    if (me.data.role !== "admin") { localStorage.clear(); throw new Error("Sem permissão de administrador"); }
    setUser(me.data);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
