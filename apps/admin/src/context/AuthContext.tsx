// Contexto de autenticação do painel de administração.
// Difere do contexto do website/app porque verifica se o utilizador tem role="admin"
// antes de permitir o acesso — qualquer outra role é tratada como não autenticada.
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

interface AdminUser { id: string; email: string; full_name: string; role: string; }

interface AuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Ref para evitar chamadas duplicadas ao `loadUser` durante o ciclo de vida inicial
  const initialized = useRef(false);

  function done(u: AdminUser | null) {
    setUser(u);
    setLoading(false);
  }

  // Lê o perfil da base de dados e verifica se o role é "admin".
  // Se não for admin (ou se ocorrer um erro), termina a sessão automaticamente.
  async function loadUser(userId: string, email: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", userId)
        .single();
      initialized.current = true;
      if (error || !data || data.role !== "admin") {
        // Utilizador autenticado mas sem permissões de admin — força logout por segurança
        await supabase.auth.signOut();
        done(null);
      } else {
        done({ id: data.id, email, full_name: data.full_name ?? "", role: data.role });
      }
    } catch {
      initialized.current = true;
      await supabase.auth.signOut();
      done(null);
    }
  }

  useEffect(() => {
    // Timeout de segurança: se o Supabase não responder em 5 segundos,
    // desbloqueia o loading para evitar que a app fique presa a carregar indefinidamente
    const timer = setTimeout(() => {
      if (!initialized.current) {
        initialized.current = true;
        setLoading(false);
      }
    }, 5000);

    // Escuta os eventos de autenticação do Supabase.
    // Só reage a INITIAL_SESSION, SIGNED_IN e TOKEN_REFRESHED para carregar o perfil;
    // outros eventos (ex: PASSWORD_RECOVERY) são ignorados propositadamente.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "INITIAL_SESSION" || _event === "SIGNED_IN" || _event === "TOKEN_REFRESHED") {
        if (session?.user) {
          loadUser(session.user.id, session.user.email ?? "");
        } else {
          initialized.current = true;
          done(null);
        }
      } else if (_event === "SIGNED_OUT") {
        initialized.current = true;
        done(null);
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // Após login bem-sucedido, o onAuthStateChange recebe SIGNED_IN e chama loadUser
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
