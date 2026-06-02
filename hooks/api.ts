// hooks/api.ts
import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { STORAGE_KEYS } from "../constants";

// -----------------------------------------------------------------------------
// Get the correct backend URL based on environment
// -----------------------------------------------------------------------------
const MY_COMPUTER_IP = "192.168.31.223";

const getBackendUrl = (): string => {
  // Web: localhost works
  if (Platform.OS === "web") return "http://localhost:5000";

  // For physical devices (iOS/Android) running Expo Go
  if (Platform.OS === "android" || Platform.OS === "ios") {
    // Try to get IP from Expo debugger host
    const debuggerHost =
      Constants.manifest?.debuggerHost || Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      const ip = debuggerHost.split(":")[0];
      return `http://${ip}:5000`;
    }
    // Fallback to your hardcoded IP (most reliable)
    return `http://${MY_COMPUTER_IP}:5000`;
  }

  // Simulator fallback
  return "http://localhost:5000";
};

const BACKEND_URL = "http://192.168.31.223:5000";

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Optional: log all requests for debugging
api.interceptors.request.use((config) => {
  console.log(
    `📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
  );
  return config;
});

// Attach auth token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
}) => {
  return api.post("/api/v1/auth/register", data);
};

export const verifyOtp = (email: string, otp: string) => {
  return api.post("/api/v1/auth/verify-otp", { email, otp });
};

export const resendOtp = (email: string) => {
  return api.post("/api/v1/auth/resend-otp", { email });
};

export const loginUser = (email: string, password: string) => {
  return api.post("/api/v1/auth/login", { email, password });
};

export const forgotPassword = (email: string) => {
  return api.post("/api/v1/auth/forgot-password", { email });
};

export const resetPassword = (token: string, newPassword: string) => {
  return api.post("/api/v1/auth/reset-password", { token, newPassword });
};

export const getCurrentUser = () => {
  return api.get("/api/v1/auth/me");
};

// -----------------------------------------------------------------------------
// 4. Verification endpoints (document uploads)
// -----------------------------------------------------------------------------
export const verifyUserDocuments = async (
  email: string,
  idCardUri: string,
  selfieUri: string,
) => {
  const formData = new FormData();
  formData.append("email", email);

  formData.append("idCard", {
    uri: idCardUri,
    name: "id-card.jpg",
    type: "image/jpeg",
  } as any);

  formData.append("selfie", {
    uri: selfieUri,
    name: "selfie.jpg",
    type: "image/jpeg",
  } as any);

  return api.post("/auth/verify-user", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;
