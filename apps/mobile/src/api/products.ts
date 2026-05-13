import { supabase } from "../lib/supabase";

export const productsApi = {
  categories: () =>
    supabase.from("categories").select("*").eq("is_active", true).order("name"),

  list: (params?: { category_id?: string; search?: string; in_stock?: boolean }) => {
    let query = supabase.from("products").select("*, category:categories(*)").eq("is_active", true);
    if (params?.category_id) query = query.eq("category_id", params.category_id);
    if (params?.search) query = query.ilike("name", `%${params.search}%`);
    if (params?.in_stock) query = query.gt("stock_quantity", 0);
    return query.order("name");
  },

  get: (id: string) =>
    supabase.from("products").select("*, category:categories(*)").eq("id", id).single(),
};
