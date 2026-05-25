import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Check stored token on app start ──────────────────────────────────────
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log("Error loading auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Register ──────────────────────────────────────────────────────────────
  const register = async (formData) => {
    try {
      const response = await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { data } = response.data;

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data));

      setToken(data.token);
      setUser(data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // ─── Admin Login ───────────────────────────────────────────────────────────
  const adminLogin = async (email, password) => {
    try {
      const response = await api.post("/admin/login", { email, password });
      const { data } = response.data;

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data));

      setToken(data.token);
      setUser(data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Admin login failed",
      };
    }
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAdmin, register, login, adminLogin, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);