// hooks/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { STORAGE_KEYS } from "../constants";

// -----------------------------------------------------------------------------
// 1. Dynamic base URL for different environments
// -----------------------------------------------------------------------------
const getBaseUrl = (): string => {
  // For web: use localhost (running on same machine)
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }
  // For Android emulator: 10.0.2.2 maps to host's localhost
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }
  // For iOS simulator (or any other): localhost works
  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// -----------------------------------------------------------------------------
// 2. Attach auth token to every request
// -----------------------------------------------------------------------------
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -----------------------------------------------------------------------------
// 3. Auth endpoints (exact paths matching backend)
// -----------------------------------------------------------------------------
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
}

export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
}) => {
  // Endpoint: POST /api/v1/auth/register (works with curl)
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
