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

export const BACKEND_URL = "http://192.168.31.223:5000";

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

  return api.post("/api/v1/auth/verify-user", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;

export interface GetProductsParams {
  search?: string;
  productType?: string;
  productCondition?: string;
  productAge?: number;
  ownerId?: string;
  page?: number;
  limit?: number;
  productId?: string;
  productSL?: string;
  latitude?: number;
  longitude?: number;
  prompt?: string;
}

export interface Product {
  id: string;
  productSL: string;
  name: string;
  productType:
    | "GADGET"
    | "FURNITURE"
    | "VEHICLE"
    | "STATIONARY"
    | "MUSICAL_INSTRUMENT"
    | "CLOTHING"
    | "BOOK"
    | "ACADEMIC_BOOK"
    | "ELECTRONICS"
    | "APARTMENTS"
    | "OTHERS";
  productCondition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  productAge: number;
  omv: number;
  pricePerDay: number;
  pricePerHour: number | null;
  secondHandPrice: number;
  askingPrice: number | null;
  minPrice: number | null;
  isForSale: boolean;
  isForSaleOnly: boolean;
  isAvailable: boolean;
  isOnHold: boolean;
  isAiEnabled: boolean;
  latitude: number;
  longitude: number;
  tags: string;
  productDescription: string;
  productImages: string[];
  optimizedImages: string[];
  scale: number;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
    securityScore: string;
    brittooVerified: boolean;
    suspensionCount: number;
    isValidRuetMail: boolean;
    isVerified: string;
    _count: { rentedOutProducts: number; borrowedProducts: number };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  productType: string;
  productCondition: string;
  productAge: string;
  omv: string;
  tags: string;
  productDescription: string;
  isForSale: string;
  isForSaleOnly: string;
  isAiEnabled?: string;
  askingPrice?: string;
  minPrice?: string;
  latitude?: string;
  longitude?: string;
}

export const getProducts = (params: GetProductsParams = {}) =>
  api.get("/api/v1/products", { params });

export const createProduct = async (
  payload: CreateProductPayload,
  images: { uri: string; name: string; type: string }[],
) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined) formData.append(k, v as string);
  });
  images.forEach((img) => formData.append("productImages", img as any));
  return api.post("/api/v1/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteProduct = (id: string) =>
  api.delete(`/api/v1/products/${id}`);

export const updateProductUser = (
  id: string,
  data: {
    isForSale?: boolean;
    isForSaleOnly?: boolean;
    isAvailable?: boolean;
    isAiEnabled?: boolean;
    askingPrice?: string;
    minPrice?: string;
    latitude?: number;
    longitude?: number;
  },
) => api.put(`/api/v1/products/update/user/${id}`, data);

export interface User {
  id: string;
  name: string;
  email: string;
  roll: string;
  role: string;
  isVerified: "UNVERIFIED" | "PENDING" | "VERIFIED";
  brittooVerified: boolean;
  isSuspended: boolean;
  suspensionCount: number;
  securityScore: number;
  emailVerified: boolean;
  isValidRuetMail: boolean;
  phoneNumber?: string;
  selfie?: string;
  idCardFront?: string;
  idCardBack?: string;
  latitude?: string;
  longitude?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

// GET /users (admin)
export interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ALL" | "VERIFIED" | "PENDING" | "UNVERIFIED" | "SUSPENDED";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UsersResponse {
  success: true;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
    };
    summary: {
      totalUsers: number;
      verified: number;
      pending: number;
      unverified: number;
      brittooVerified: number;
      suspended: number;
    };
  };
}

// GET /users/:userId
export interface UserDetailsResponse {
  success: true;
  data: {
    user: User & {
      bccWallet?: any;
      redCacheCredits: any[];
      rentedOutProducts: any[];
      borrowedProducts: any[];
      rentalRequestsMade: any[];
      rentalRequestsReceived: any[];
    };
    walletSummary: {
      availableBalance: number;
      lockedBalance: number;
      totalBalance: number;
    };
    creditSummary: {
      totalRedCredits: number;
      totalRedCreditsInUse: number;
      availableRedCredits: number;
    };
    rentalStats: {
      totalRentalsCompleted: number;
      totalRentalsActive: number;
      totalRentalsCancelled: number;
      totalEarnings: number;
      totalSpent: number;
    };
    locationInfo: any;
    documentStatus: any;
    stats: any;
  };
}

// PATCH /users/:userId/verify
export interface VerifyUserResponse {
  success: true;
  message: string;
  data: { user: User };
}

// PATCH /users/:userId/suspend
export interface SuspendUserResponse {
  success: true;
  message: string;
  data: User;
}

// GET /users/:userId/credits
export interface UserCreditHistoryResponse {
  success: true;
  data: {
    bccWallet: any;
    redCacheCredits: any[];
    bccTransactions: any[];
    rentalHistory: any[];
    summary: {
      bcc: any;
      rcc: any;
      rentals: any;
    };
  };
}

// GET /users/:userId/placed-requests
export interface PlacedRequestsResponse {
  success: true;
  data: any[];
}

// GET /users/:userId/received-requests
export interface ReceivedRequestsResponse {
  success: true;
  data: any[];
}

// GET /users/:userId/withdrawals
export interface WithdrawalRequestsResponse {
  success: true;
  data: any[];
}

// ─── Admin — Users ────────────────────────────────────────────────────────────

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ALL" | "VERIFIED" | "PENDING" | "UNVERIFIED" | "SUSPENDED";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const adminGetUsers = (params: GetUsersParams = {}) =>
  api.get("/api/v1/users", { params });

export const adminGetUserDetails = (userId: string) =>
  api.get(`/api/v1/users/${userId}`);

export const adminVerifyUser = (userId: string) =>
  api.put(`/api/v1/users/verify/${userId}`, {});

export const adminSuspendUser = (userId: string) =>
  api.put(`/api/v1/users/suspend/${userId}`, {});

export const adminGetUserCreditHistory = (userId: string) =>
  api.get(`/api/v1/users/${userId}/credit-history`);

export const adminGetUserPlacedRequests = (userId: string) =>
  api.get(`/api/v1/users/${userId}/placed-requests`);

export const adminGetUserReceivedRequests = (userId: string) =>
  api.get(`/api/v1/users/${userId}/received-requests`);

export const adminGetUserTotalCredits = () => api.get("/users/total-credits");

// ─── Admin — Products ─────────────────────────────────────────────────────────

export interface AdminUpdateProductPayload {
  name?: string;
  productType?: string;
  productCondition?: string;
  productAge?: string;
  omv?: string;
  tags?: string;
  productDescription?: string;
  isForSale?: string;
  scale?: string;
  deleteImages?: string;
}

export const adminUpdateProduct = async (
  id: string,
  payload: AdminUpdateProductPayload,
  newImages?: { uri: string; name: string; type: string }[],
) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined) formData.append(k, v as string);
  });
  if (newImages?.length) {
    newImages.forEach((img) => formData.append("productImages", img as any));
  }
  return api.put(`/api/v1/products/update/admin/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ─── Admin — Rental Requests ──────────────────────────────────────────────────

export interface GetRentalRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  productId?: string;
  ownerId?: string;
  requesterId?: string;
  productSL?: string;
}

export const adminGetRentalRequests = (params: GetRentalRequestsParams = {}) =>
  api.get("/api/v1/rental-requests/all", { params });

export const adminUpdateRentalStatus = (requestId: string, status: string) =>
  api.put(`/api/v1/rental-requests/${requestId}/status`, { status });

export const adminRejectRental = (requestId: string, brittooRejectReason: string) =>
  api.put(`/api/v1/rental-requests/${requestId}/reject`, {
    brittooRejectReason,
  });

// ─── Admin — Dashboard Analytics ──────────────────────────────────────────────

export const adminGetAnalytics = () => api.get("/admin/analytics");

export const adminHoldProduct = (productId: string) =>
  api.put(`/api/v1/admin/hold/${productId}`, {});

// ─── Admin — Purchase Requests ────────────────────────────────────────────────

export const adminGetPurchaseRequests = () => api.get("/purchase-requests/all");

export const adminUpdatePurchaseStatus = (requestId: string, status: string) =>
  api.put(`/api/v1/purchase-requests/${requestId}/status`, { status });

export const adminUpdatePurchasePayment = (requestId: string, paymentStatus: string) =>
  api.put(`/api/v1/purchase-requests/${requestId}/payment-status`, {
    paymentStatus,
  });
