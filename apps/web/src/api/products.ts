import { supabase } from "../lib/supabase";
import type { Product } from "../types";

export const productsApi = {
  list: async (categorySlug?: string) => {
    let q = supabase.from("products").select("*, category:categories(*)").eq("is_active", true).order("name");
    if (categorySlug) q = q.eq("categories.slug", categorySlug);
    const { data } = await q;
    return { data: (data ?? []) as Product[] };
  },

  get: async (id: string) => {
    const { data } = await supabase.from("products").select("*, category:categories(*)").eq("id", id).single();
    return { data: data as Product };
  },

  categories: async () => {
    const { data } = await supabase.from("categories").select("*").eq("is_active", true).order("name");
    return { data: data ?? [] };
  },
};
