// services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";

/**
 * Get the correct backend URL based on the platform.
 * - Android emulator: 10.0.2.2 (special alias for host machine's localhost)
 * - Android physical device: use your computer's LAN IP (must be manually set)
 * - iOS simulator / web: localhost works
 *
 * IMPORTANT: For a physical Android device, change `physicalDeviceIp` below
 * to your computer's actual IP address on your local network.
 */
const getBaseUrl = (): string => {
  // For physical Android device, use your computer's LAN IP
  const physicalDeviceIp = "192.168.1.100"; // ← CHANGE THIS TO YOUR PC's IP

  if (Platform.OS === "android") {

    return "http://10.0.2.2:5000";
  }
  // iOS simulator, web, or any other platform
  return "http://localhost:5000";
};

const API_BASE_URL = getBaseUrl();

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor: attach JWT token to every request
api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Failed to get token from storage", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 (Unauthorized) globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Token expired or invalid → clear stored credentials
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");
      // Optionally dispatch a logout event or reload the app
      // You can emit a custom event that your auth store listens to
      // For now, we just reject the promise.
    }
    return Promise.reject(error);
  },
);

export default api;
