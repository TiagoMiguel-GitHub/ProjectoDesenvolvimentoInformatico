import { supabase } from "../lib/supabase";
import { Address, User } from "../types";

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Não autenticado");
  return session.user.id;
}

export const authApi = {
  me: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Não autenticado");
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    return { data: { ...data, email: session.user.email } as User };
  },

  updateMe: async (payload: { full_name?: string; phone?: string }) => {
    const userId = await getUserId();
    const { data } = await supabase.from("profiles").update(payload).eq("id", userId).select().single();
    return { data: data as User };
  },

  updatePushToken: async (expo_push_token: string) => {
    const userId = await getUserId();
    return supabase.from("profiles").update({ expo_push_token }).eq("id", userId);
  },

  listAddresses: async () => {
    const userId = await getUserId();
    const { data } = await supabase.from("addresses").select("*").eq("user_id", userId).order("is_default", { ascending: false });
    return { data: (data ?? []) as Address[] };
  },

  addAddress: async (address: Omit<Address, "id">) => {
    const userId = await getUserId();
    const { data } = await supabase.from("addresses").insert({ ...address, user_id: userId }).select().single();
    return { data: data as Address };
  },

  deleteAddress: (id: string) =>
    supabase.from("addresses").delete().eq("id", id),

  setDefaultAddress: async (id: string) => {
    const userId = await getUserId();
    // remove a predefinida anterior antes de definir a nova
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    return supabase.from("addresses").update({ is_default: true }).eq("id", id);
  },
};
