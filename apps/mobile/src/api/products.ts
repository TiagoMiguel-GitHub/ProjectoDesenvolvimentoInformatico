import { api } from "./client";
import { Category, Product } from "../types";

export const productsApi = {
  categories: () => api.get<Category[]>("/products/categories"),

  list: (params?: { category_id?: string; search?: string; min_price?: number; max_price?: number; in_stock?: boolean }) =>
    api.get<Product[]>("/products", { params }),

  get: (id: string) => api.get<Product>(`/products/${id}`),
};
