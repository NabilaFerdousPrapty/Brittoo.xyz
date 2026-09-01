// hooks/api.ts

import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { STORAGE_KEYS } from "../constants";

// -----------------------------------------------------------------------------
// Backend URL Configuration
// -----------------------------------------------------------------------------

const MY_COMPUTER_IP = "192.168.31.223";

const getBackendUrl = (): string => {
  // Web browser
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }

  // Android Studio Emulator
  if (Platform.OS === "android") {
    const hostUri = Constants.expoConfig?.hostUri;

    // If running through Expo Go on a physical Android device
    if (hostUri) {
      const ip = hostUri.split(":")[0];
      return `http://${ip}:5000`;
    }

    // Android Emulator
    return "http://10.0.2.2:5000";
  }

  // iOS
  if (Platform.OS === "ios") {
    const hostUri = Constants.expoConfig?.hostUri;

    // Physical iPhone
    if (hostUri) {
      const ip = hostUri.split(":")[0];
      return `http://${ip}:5000`;
    }

    // iOS Simulator
    return "http://localhost:5000";
  }

  // Fallback
  return `http://${MY_COMPUTER_IP}:5000`;
};

export const BACKEND_URL = getBackendUrl();

console.log("BACKEND_URL:", BACKEND_URL);

// -----------------------------------------------------------------------------
// Axios Instance
// -----------------------------------------------------------------------------

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
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

export const getCurrentUser = () => api.get("/api/v1/auth/get-current-user");

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
  api.get("/api/v1/admin/rental-requests", { params });

export const adminUpdateRentalStatus = (requestId: string, status: string) =>
  api.put(
    `/api/v1/admin/rental-requests/${requestId}/update-status`,
    { status }
  );
export const adminRejectRental = (
  requestId: string,
  brittooRejectReason: string
) =>
  api.put(`/api/v1/admin/rental-requests/${requestId}/reject`, {
    brittooRejectReason,
  });

// ─── Admin — Dashboard Analytics ──────────────────────────────────────────────

export const adminGetAnalytics = () =>
  api.get("/api/v1/admin-dash/analytics");

export const adminHoldProduct = (productId: string) =>
  api.put(`/api/v1/admin/hold/${productId}`, {});

// ─── Admin — Purchase Requests ────────────────────────────────────────────────

export const adminGetPurchaseRequests = () => api.get("/api/v1/purchase-requests/all");

export const adminUpdatePurchaseStatus = (requestId: string, status: string) =>
  api.put(`/api/v1/purchase-requests/${requestId}/status`, { status });

export const adminUpdatePurchasePayment = (
  requestId: string,
  paymentStatus: string,
) =>
  api.put(`/api/v1/purchase-requests/${requestId}/payment-status`, {
    paymentStatus,
  });


export interface UserOverviewResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    wallet: {
      availableBalance: number;
      lockedBalance: number;
    } | null;
    stats: {
      activeRentals: number;
      productsListed: number;
      totalRccCredits: number;
      pendingRequestsCount: number;
    };
    recentActivity: {
      title: string;
      time: string;
      type: "transaction" | "rental";
    }[];
    pendingRequests: {
      id: string;
      productName: string;
      type: "incoming" | "outgoing";
      time: string;
      requesterName?: string;
      status?: string;
    }[];
  };
}

export const getUserOverview = () =>
  api.get<UserOverviewResponse>("/api/v1/user-dashboard/overview");

export interface UserCreditHistoryDashResponse {
  success: boolean;
  data: {
    bccWallet: { availableBalance: number; lockedBalance: number } | null;
    redCacheCredits: {
      id: string;
      amount: number;
      inUse: number;
      isFrozen: boolean;
      createdAt: string;
      sourceProduct: {
        id: string;
        name: string;
        productSL: string;
        optimizedImages: string[];
        pricePerDay: number;
      };
    }[];
    bccTransactions: {
      id: string;
      amount: number;
      rentalRequestId: string | null;
      paymentGateway: string | null;
      transactionId: string | null;
      transactionType: string;
      status: "PENDING" | "ACCEPTED" | "REJECTED";
      rejectReason: string | null;
      createdAt: string;
      updatedAt: string;
    }[];
    rentalHistory: {
      id: string;
      status: string;
      usedBccAmount: number | null;
      product: {
        id: string;
        name: string;
        pricePerDay: number;
        productSL: string;
        optimizedImages: string[];
      };
      rccUsageDetails: {
        usedAmount: number;
        redCacheCredit: {
          sourceProduct: {
            id: string;
            name: string;
            productSL: string;
            pricePerDay: number;
          };
        };
      }[];
    }[];
    summary: {
      bcc: {
        lockedBalance: number;
        availableBalance: number;
        totalPurchased: number;
        totalSpent: number;
        pendingBccRequests: any[];
        totalPendingBcc: number;
      };
      rcc: {
        totalAmount: number;
        totalInUse: number;
        availableAmount: number;
        totalCredits: number;
        usageByProduct: Record<
          string,
          { productName: string; totalUsed: number; usageCount: number }
        >;
      };
      rentals: {
        totalRentals: number;
        completedRentals: number;
        totalValue: number;
        averageRentalValue: number;
      };
    };
  };
}

export const getUserCreditHistoryDash = () =>
  api.get<UserCreditHistoryDashResponse>(
    "/api/v1/user-dashboard/credits/credit-history",
  );


// get and post rental request

// ─── Rental Requests — User ─────────────────────────────────────────────────

// Create a rental request
// POST /api/v1/rental-requests/create-request
export const createRentalRequest = (data: any) =>
  api.post("/api/v1/rental-requests/create-request", data);


// Get rental requests placed by the logged-in user
// GET /api/v1/rental-requests/placed-requests
export const getUserPlacedRentalRequests = () =>
  api.get("/api/v1/rental-requests/placed-requests");


// Get rental requests received by the logged-in user (product owner)
// GET /api/v1/rental-requests/owner-requests
export const getOwnerRentalRequests = () =>
  api.get("/api/v1/rental-requests/owner-requests");


// Accept a rental request
// PUT /api/v1/rental-requests/accept/:requestId
export const acceptRentalRequest = (requestId: string) =>
  api.put(`/api/v1/rental-requests/accept/${requestId}`);


// Cancel a rental request
// PUT /api/v1/rental-requests/cancel/:requestId
export const cancelRentalRequest = (requestId: string) =>
  api.put(`/api/v1/rental-requests/cancel/${requestId}`);


// Reject a rental request
// PUT /api/v1/rental-requests/reject/:requestId
export const rejectRentalRequest = (requestId: string) =>
  api.put(`/api/v1/rental-requests/reject/${requestId}`);


// ============================================================
// PURCHASE REQUEST APIs
// ============================================================

export type PurchaseCollectionMethod =
  | "HOME"
  | "BRITTOO_TERMINAL";

export interface PlacePurchaseRequestPayload {
  productId: string;
  dealPrice: number | string;
  buyerCollectionMethod: PurchaseCollectionMethod;
  buyerPhoneNumber: string;
  buyerDeliveryAddress?: string | null;
  buyerPickupTerminal?: string | null;
}

export interface AcceptPurchaseRequestPayload {
  sellerDeliveryMethod: PurchaseCollectionMethod;
  sellerPhoneNumber: string;
  sellerDeliveryAddress?: string | null;
  sellerDeliveryTerminal?: string | null;
}

export interface PurchaseRequest {
  id: string;

  productId: string;
  buyerId: string;
  sellerId: string;

  askingPrice: number;
  dealPrice: number;
  platformCharge: number;
  totalPrice: number;

  status: string;
  paymentStatus?: string;

  buyerCollectionMethod: PurchaseCollectionMethod;
  buyerPhoneNumber: string;
  buyerDeliveryAddress?: string | null;
  buyerPickupTerminal?: string | null;

  sellerPhoneNumber?: string | null;
  sellerDeliveryMethod?: PurchaseCollectionMethod | null;
  sellerDeliveryAddress?: string | null;
  sellerDeliveryTerminal?: string | null;

  sellerRejectReason?: string | null;
  buyerCancelReason?: string | null;
  brittooRejectReason?: string | null;

  createdAt: string;
  updatedAt: string;

  product?: Product;
  buyer?: any;
  seller?: any;
}

export interface PurchaseRequestListResponse {
  success: boolean;
  data: PurchaseRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
/**
 * Buyer:
 * Place a purchase request
 *
 * POST /api/v1/purchase/place
 */
export const placePurchaseRequest = (
  data: PlacePurchaseRequestPayload
) => {
  return api.post<{
    success: boolean;
    message: string;
    data: PurchaseRequest;
  }>("/api/v1/purchase/place", data);
};


/**
 * Buyer:
 * Cancel a purchase request
 *
 * PUT /api/v1/purchase/:requestId/cancel
 */
export const cancelPurchaseRequest = (
  requestId: string,
  buyerCancelReason: string
) => {
  return api.put<{
    success: boolean;
    message: string;
    data: PurchaseRequest;
  }>(
    `/api/v1/purchase/${requestId}/cancel`,
    {
      buyerCancelReason,
    }
  );
};


/**
 * Buyer:
 * Get purchase requests placed by current user
 *
 * GET /api/v1/purchase/placed
 */
export const getPlacedPurchaseRequests = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return api.get<PurchaseRequestListResponse>(
    "/api/v1/purchase/placed",
    {
      params,
    }
  );
};


/**
 * Seller:
 * Accept a purchase request
 *
 * PUT /api/v1/purchase/:requestId/accept
 */
export const acceptPurchaseRequest = (
  requestId: string,
  data: AcceptPurchaseRequestPayload
) => {
  return api.put<{
    success: boolean;
    message: string;
    data: PurchaseRequest;
  }>(
    `/api/v1/purchase/${requestId}/accept`,
    data
  );
};


/**
 * Seller:
 * Reject a purchase request
 *
 * PUT /api/v1/purchase/:requestId/reject
 */
export const rejectPurchaseRequest = (
  requestId: string,
  sellerRejectReason: string
) => {
  return api.put<{
    success: boolean;
    message: string;
    data: PurchaseRequest;
  }>(
    `/api/v1/purchase/${requestId}/reject`,
    {
      sellerRejectReason,
    }
  );
};


/**
 * Seller:
 * Get purchase requests received for own products
 *
 * GET /api/v1/purchase/received
 */
export const getReceivedPurchaseRequests = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return api.get<PurchaseRequestListResponse>(
    "/api/v1/purchase/received",
    {
      params,
    }
  );
};

// ============================================================
// CHAT APIs
// ============================================================

export interface ChatBasicUser {
  id: string;
  name: string;
  email: string;
}

export interface ChatProduct {
  id: string;
  name: string;
  productImages: string[];
  askingPrice: number | null;
  minPrice: number | null;
  isForSale?: boolean;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: ChatBasicUser;
}

export interface ChatRoom {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product: ChatProduct;
  buyer: ChatBasicUser;
  seller: ChatBasicUser;
  messages: ChatMessage[];
  totalMessages?: number;
  hasMore?: boolean;
  isSellerOnline?: boolean;
  isPartnerOnline?: boolean;
  unreadCount?: number;
  _count?: { messages: number };
}

export interface ChatMessagesData {
  messages: ChatMessage[];
  chatRoom: {
    id: string;
    product: ChatProduct;
    buyer: ChatBasicUser;
    seller: ChatBasicUser;
    buyerId: string;
    sellerId: string;
    isPartnerOnline: boolean;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasMore: boolean;
  };
}

export interface CreateOrGetChatRoomResponse {
  success: boolean;
  message: string;
  data: ChatRoom;
}

export interface GetMyChatRoomsResponse {
  success: boolean;
  message: string;
  data: ChatRoom[];
}

export interface GetChatMessagesResponse {
  success: boolean;
  message: string;
  data: ChatMessagesData;
}

export interface DeleteChatRoomResponse {
  success: boolean;
  message: string;
}

export interface GetAllChatRoomsAdminResponse {
  success: boolean;
  message: string;
  data: ChatRoom[];
}

// ─── Chat — User ──────────────────────────────────────────────────────────────

/**
 * Create a chat room for a product (as buyer), or fetch the existing one
 *
 * POST /api/v1/chat/room
 */
export const createOrGetChatRoom = (productId: string) =>
  api.post<CreateOrGetChatRoomResponse>("/api/v1/chat/room", { productId });

/**
 * Get all chat rooms (buyer + seller side) for the current user
 *
 * GET /api/v1/chat/rooms
 */
export const getMyChatRooms = () =>
  api.get<GetMyChatRoomsResponse>("/api/v1/chat/rooms");

/**
 * Get paginated messages for a chat room. Also marks incoming messages as read.
 *
 * GET /api/v1/chat/room/:chatRoomId/messages
 */
export const getChatMessages = (
  chatRoomId: string,
  params?: { page?: number; limit?: number },
) =>
  api.get<GetChatMessagesResponse>(
    `/api/v1/chat/room/${chatRoomId}/messages`,
    { params },
  );

// ─── Chat — Admin ─────────────────────────────────────────────────────────────

/**
 * Admin: get all chat rooms across the platform
 *
 * GET /api/v1/chat/admin/rooms
 */
export const adminGetAllChatRooms = () =>
  api.get<GetAllChatRoomsAdminResponse>("/api/v1/chat/admin/rooms");

/**
 * Admin: soft-delete (deactivate) a chat room
 *
 * DELETE /api/v1/chat/room/:chatRoomId
 */
export const adminDeleteChatRoom = (chatRoomId: string) =>
  api.delete<DeleteChatRoomResponse>(`/api/v1/chat/room/${chatRoomId}`);

// ============================================================
// NOTIFICATION APIs
// ============================================================

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data: { url?: string; [key: string]: any };
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SentNotification {
  id: string;
  title: string;
  body: string;
  targets: string; // 'all' | comma-separated userIds/emails
  createdAt: string;
}

export interface GetUserNotificationsResponse {
  success: boolean;
  data: UserNotification[];
}

export interface GetSentNotificationsResponse {
  success: boolean;
  data: SentNotification[];
}

export interface SendCustomNotificationPayload {
  title: string;
  body: string;
  targets: "all" | string[]; // array of userIds or emails
  url?: string;
}

// ─── Notifications — User ─────────────────────────────────────────────────────

/**
 * Save/update the device's push subscription
 *
 * POST /api/v1/notifications/subscribe
 */
export const savePushSubscription = (subscription: PushSubscriptionPayload) =>
  api.post<{ success: boolean; message: string }>(
    "/api/v1/notifications/subscribe",
    { subscription },
  );

/**
 * Get notifications for the logged-in user
 *
 * GET /api/v1/notifications
 */
export const getMyNotifications = () =>
  api.get<GetUserNotificationsResponse>("/api/v1/notifications");

/**
 * Mark a notification as read
 *
 * PUT /api/v1/notifications/:id/read
 */
export const markNotificationAsRead = (id: string) =>
  api.put<{ success: boolean }>(`/api/v1/notifications/${id}/read`);

// ─── Notifications — Admin ────────────────────────────────────────────────────

/**
 * Admin: send a custom notification to all users or a target list
 *
 * POST /api/v1/notifications/custom
 */
export const adminSendCustomNotification = (
  data: SendCustomNotificationPayload,
) =>
  api.post<{ success: boolean; message: string }>(
    "/api/v1/notifications/custom",
    data,
  );

/**
 * Admin: get history of previously sent custom notifications
 *
 * GET /api/v1/notifications/sent
 */
export const adminGetSentNotifications = () =>
  api.get<GetSentNotificationsResponse>("/api/v1/notifications/sent");

// ============================================================
// BCC (Blue Cache Credit) APIs
// ============================================================

export interface BccWallet {
  id: string;
  userId: string;
  availableBalance: number;
  lockedBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface BccTransaction {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  rentalRequestId: string | null;
  paymentGateway: string | null;
  transactionId: string | null;
  numberUsedInTrx?: string | null;
  transactionType:
    | "RENT_DEPOSIT"
    | "DEPOSIT_REFUND"
    | "BONUS_CREDIT"
    | "PURCHASE_BCC"
    | "MONEY_WITHDRAWAL"
    | "ADJUSTMENT";
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  rejectReason?: string | null;
  refundTrxId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BuyBccPayload {
  paymentGateway: string;
  amount: number;
  transactionId: string;
  trxNo: string; // phone number used for the transaction, WITHOUT country code — backend prefixes "+880"
}

export interface BuyBccResponse {
  success: boolean;
  message: string;
  data: BccTransaction;
}

export interface AvailableBccResponse {
  success: boolean;
  isWalletPresent: boolean;
  message: string;
  data: BccWallet | { availableBalance: number; lockedBalance: number };
}

export interface PendingBccRequestsResponse {
  success: boolean;
  message: string;
  data: (BccTransaction & { user: User })[];
  count: number;
}

// ─── BCC — User ───────────────────────────────────────────────────────────────

/**
 * Submit a BCC purchase request (goes to PENDING until admin accepts)
 * Requires the user to be verified (verificationMiddleware on backend)
 *
 * POST /api/v1/bcc/buy
 */
export const buyBcc = (data: BuyBccPayload) =>
  api.post<BuyBccResponse>("/api/v1/bcc/buy", data);

/**
 * Get a user's BCC wallet balance
 *
 * GET /api/v1/bcc/available/:userId
 */
export const getUsersAvailableBcc = (userId: string) =>
  api.get<AvailableBccResponse>(`/api/v1/bcc/available/${userId}`);

// ─── BCC — Admin ──────────────────────────────────────────────────────────────

/**
 * Admin: get all pending BCC purchase requests
 *
 * GET /api/v1/bcc/pending
 */
export const adminGetPendingBccRequests = () =>
  api.get<PendingBccRequestsResponse>("/api/v1/bcc/pending");

/**
 * Admin: accept a pending BCC purchase request
 * NOTE: backend route uses POST, not PUT/PATCH
 *
 * POST /api/v1/bcc/accept/:creditId
 */
export const adminAcceptBccRequest = (creditId: string) =>
  api.post<{ success: boolean; message: string }>(
    `/api/v1/bcc/accept/${creditId}`,
  );

/**
 * Admin: reject a pending BCC purchase request
 *
 * PUT /api/v1/bcc/reject/:creditId
 */
export const adminRejectBccRequest = (
  creditId: string,
  data: { rejectReason: string; refundTrxId?: string },
) =>
  api.put<{ success: boolean; message: string }>(
    `/api/v1/bcc/reject/${creditId}`,
    data,
  );

// ============================================================
// RCC (Red Cache Credit) APIs
// ============================================================

export interface RedCacheCredit {
  id: string;
  amount: number;
  inUse: number;
  isFrozen: boolean;
  userId: string;
  sourceProductId: string;
  isGiftCredit: boolean;
  validityDate: string | null;
  giftReason?: string | null;
  giftedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  sourceProduct: {
    id: string;
    name: string;
    productSL: string;
    productType?: string;
    optimizedImages?: string[];
    pricePerDay?: number;
  };
}

export interface AvailableRccResponse {
  success: boolean;
  message: string;
  data: RedCacheCredit[];
}

export interface GiftRccPayload {
  userId: string;
  amount: number | string;
  validityDays?: number | string;
  giftReason?: string;
}

export interface GiftRccResponse {
  success: boolean;
  message: string;
  data: RedCacheCredit;
}

// ─── RCC — User ───────────────────────────────────────────────────────────────

/**
 * Get a user's available Red Cache Credits (with source product info)
 *
 * GET /api/v1/rcc/available/:userId
 */
export const getUsersAvailableRcc = (userId: string) =>
  api.get<AvailableRccResponse>(`/api/v1/rcc/available/${userId}`);

// ─── RCC — Admin ──────────────────────────────────────────────────────────────

/**
 * Admin: gift RCC to a user (creates a virtual product + gift credit)
 *
 * POST /api/v1/rcc/gift-rcc
 */
export const adminGiftRcc = (data: GiftRccPayload) =>
  api.post<GiftRccResponse>("/api/v1/rcc/gift-rcc", data);