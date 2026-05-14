// store/useAuthStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Platform } from "react-native";
import { create } from "zustand";
import api from "../services/api";
import { User } from "../types/auth";
import getPublicIP from "../utils/getPublicIP";
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  loadStoredUser: () => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    email?: string;
    message?: string;
    error?: string;
  }>;
  verifyOtp: (
    email: string,
    otp: string,
  ) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (
    email: string,
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  login: (email: string, password: string) => Promise<boolean>;
  forgotPassword: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    token: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}
const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === "web") {
      // Use localStorage on web
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  loadStoredUser: async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userStr = await AsyncStorage.getItem("userData");
      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        set({ token, user, isLoading: false });
        // Validate token with /me endpoint
        try {
          const res = await api.get("/auth/me");
          set({ user: res.data.data });
        } catch {
          // Token invalid
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("userData");
          set({ token: null, user: null });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to load auth data", error);
      set({ isLoading: false });
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      let latitude: number | null = null,
        longitude: number | null = null;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      }
      const ipAddress = await getPublicIP();

      const payload = { name, email, password, latitude, longitude, ipAddress };
      const response = await api.post("/auth/register", payload);
      set({ isLoading: false });
      return { success: true, email, message: response.data.message };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      const { user, token } = response.data;
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      set({ user, token, isLoading: false });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "OTP verification failed";
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  resendOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/resend-otp", { email });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to resend OTP";
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data;
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      set({ user, token, isLoading: false });
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Invalid credentials";
      set({ isLoading: false, error: errorMsg });
      return false;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/auth/forgot-password", { email });
      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to send reset email";
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Password reset failed";
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userData");
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
