// Contexto de autenticação para o website.
// Mais simples que o da app mobile: sem registo de push tokens nem campo de email separado,
// já que o browser não tem notificações nativas e o perfil já inclui o email.
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Lê o perfil da tabela `profiles` usando o ID do utilizador autenticado
  async function loadUser(id: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
    setUser(data ?? null);
  }

  // Força a re-leitura do perfil — chamada após o utilizador editar os seus dados
  async function refreshUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await loadUser(session.user.id);
  }

  useEffect(() => {
    // Verifica a sessão existente ao carregar a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUser(session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    // Mantém o estado sincronizado com eventos de auth (login, logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadUser(session.user.id);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Termina a sessão e limpa o utilizador do estado local
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
