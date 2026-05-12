import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const getBaseUrl = () => {
  if (__DEV__) {
    const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
    return `http://${host}:8000`;
  }
  return "http://localhost:8000";
};

const BASE_URL = getBaseUrl();

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await SecureStore.getItemAsync("refresh_token");
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh });
        await SecureStore.setItemAsync("access_token", data.access_token);
        await SecureStore.setItemAsync("refresh_token", data.refresh_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
      }
    }
    return Promise.reject(error);
  }
);
