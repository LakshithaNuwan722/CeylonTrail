import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─────────────────────────────────────────────────────────────────────────────
// 🔴 CHANGE THIS TO YOUR LOCAL IP ADDRESS
// Find your IP: Windows = ipconfig | Mac = ifconfig
// Example: http://192.168.1.5:5000
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://192.168.8.123:5000"; // 🔴 CHANGE THIS IP

export { BASE_URL };
export const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Attach token automatically ──────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Token read error:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Handle 401 globally ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;