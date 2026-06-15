import { supabase } from "../lib/supabase";

export const authApi = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  register: async (email: string, password: string, full_name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  updateMe: async (payload: { full_name?: string; phone?: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Não autenticado");
    const { error } = await supabase.from("profiles").update(payload).eq("id", session.user.id);
    if (error) throw new Error(error.message);
  },

  listAddresses: async () => {
    const { data } = await supabase.from("addresses").select("*").order("is_default", { ascending: false });
    return { data: data ?? [] };
  },

  addAddress: async (payload: { label?: string; street: string; city: string; postal_code: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Não autenticado");
    const { error } = await supabase.from("addresses").insert({ ...payload, user_id: session.user.id });
    if (error) throw new Error(error.message);
  },

  deleteAddress: async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  setDefaultAddress: async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Não autenticado");
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", session.user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
  },
};
