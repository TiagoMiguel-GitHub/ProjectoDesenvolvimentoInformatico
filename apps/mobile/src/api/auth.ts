import { api } from "./client";
import { Address, User } from "../types";

export const authApi = {
  register: (data: { full_name: string; email: string; phone?: string; password: string }) =>
    api.post<{ access_token: string; refresh_token: string }>("/auth/register", data),

  login: (email: string, password: string) =>
    api.post<{ access_token: string; refresh_token: string }>("/auth/login", { email, password }),

  me: () => api.get<User>("/auth/me"),

  updateMe: (data: { full_name?: string; phone?: string }) => api.patch<User>("/auth/me", data),

  updatePushToken: (expo_push_token: string) =>
    api.post("/auth/me/push-token", { expo_push_token }),

  listAddresses: () => api.get<Address[]>("/auth/me/addresses"),

  addAddress: (data: Omit<Address, "id">) => api.post<Address>("/auth/me/addresses", data),

  deleteAddress: (id: string) => api.delete(`/auth/me/addresses/${id}`),
};
