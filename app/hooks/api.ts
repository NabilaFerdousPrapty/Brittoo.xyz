import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL, STORAGE_KEYS } from "../constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
}

export const registerUser = (data: RegisterPayload) =>
  api.post("/auth/register", data);

export const verifyOTP = (email: string, otp: string) =>
  api.post("/auth/verify-otp", { email, otp });

export const resendOTP = (email: string) =>
  api.post("/auth/resend-otp", { email });

export const loginUser = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

export const getCurrentUser = () => api.get("/auth/get-current-user");

export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (token: string, newPassword: string) =>
  api.post("/auth/reset-password", { token, newPassword });

// ─── Verification ─────────────────────────────────────────────────────────────

export const verifyUserDocuments = async (
  email: string,
  idCardUri: string,
  selfieUri: string
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
