// Contexto global de autenticação — fornece o utilizador autenticado e métodos de sessão
// a toda a aplicação através do React Context API.
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { registerPushToken } from "../lib/notifications";
import { User } from "../types";

// Contrato do contexto: define quais os valores e funções expostos aos componentes filhos
interface AuthContextValue {
  user: User | null;       // perfil do utilizador autenticado (null se não autenticado)
  loading: boolean;        // true enquanto a sessão inicial ainda está a ser verificada
  login: (email: string, password: string) => Promise<void>;
  register: (data: { full_name: string; email: string; phone?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>; // força a re-leitura do perfil (ex: após edição de dados)
}

// Cria o contexto com valor nulo forçado — nunca é usado sem o Provider
const AuthContext = createContext<AuthContextValue>(null!);

// Lê o perfil da tabela `profiles` e junta o email vindo do sistema de auth do Supabase.
// O email não é guardado em `profiles`, por isso é necessário buscá-lo da sessão.
async function fetchProfile(userId: string): Promise<User | null> {
  const { data: session } = await supabase.auth.getSession();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (!data) return null;
  return { ...data, email: session.session?.user.email ?? "" };
}

// Provider que envolve toda a app e disponibiliza o contexto de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se já existe uma sessão ativa ao arrancar a aplicação
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false); // a partir daqui a app já sabe se há sessão ou não
    });

    // Subscreve eventos de autenticação (login, logout, refresh de token, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
        // Regista o token de notificações push apenas no momento do login
        if (_event === "SIGNED_IN") registerPushToken();
      } else {
        setUser(null);
      }
    });

    // Cancela a subscrição quando o componente é desmontado para evitar fugas de memória
    return () => subscription.unsubscribe();
  }, []);

  // Autentica com email e password — o Supabase atualiza a sessão e dispara o onAuthStateChange
  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }

  // Cria uma nova conta; os dados extra (nome, telefone) ficam nos metadados do utilizador
  // e são depois copiados para a tabela `profiles` por um trigger na base de dados
  async function register(payload: { full_name: string; email: string; phone?: string; password: string }) {
    const { error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: { data: { full_name: payload.full_name, phone: payload.phone ?? "" } },
    });
    if (error) throw new Error(error.message);
  }

  // Termina a sessão — o onAuthStateChange recebe o evento e limpa o utilizador do estado
  async function logout() {
    await supabase.auth.signOut();
  }

  // Re-lê o perfil da base de dados — útil após o utilizador editar o seu nome ou telefone
  async function refreshUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      setUser(profile);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook utilitário para aceder ao contexto sem importar o AuthContext diretamente
export const useAuth = () => useContext(AuthContext);
