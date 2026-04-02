// services/mockDataService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAverageRating,
  getMockChatRoomsByUser,
  getMockNotificationsByUser,
  getMockProductById,
  getMockProductsByOwner,
  getMockPurchaseRequestsByUser,
  getMockRentalRequestsByUser,
  getMockReviewsByProduct,
  getMockUserById,
  getMockWalletByUser,
  mockBccTransactions,
  mockCoupons,
  mockMessages,
  mockProducts,
  mockRedCacheCredits,
  mockRentalRequests,
  mockUsers,
} from "../constants/newMockdata";
import {
  ApiResponse,
  AuthResponse,
  BccStatus,
  BccTransaction,
  BccTransactionType,
  BccWallet,
  ChatRoom,
  CollectionOrDepositMethod,
  Coupon,
  Message,
  PaymentGateway,
  Product,
  ProductResponse,
  PurchaseRequest,
  PurchaseRequestPaymentStatus,
  PurchaseRequestStatus,
  RedCacheCredit,
  RentalRequest,
  RentalRequestStatus,
  Role,
  SecurityScore,
  User,
  UserNotification,
  VerifyStatus,
} from "../types/brittoo.types";

// Simulate network delay
const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

class MockDataService {
  private currentUser: User | null = null;
  private token: string | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.loadStoredSession();
  }

  private async loadStoredSession() {
    try {
      const storedUser = await AsyncStorage.getItem("currentUser");
      const storedToken = await AsyncStorage.getItem("authToken");

      if (storedUser && storedToken) {
        this.currentUser = JSON.parse(storedUser);
        this.token = storedToken;
      }
    } catch (error) {
      console.error("Failed to load stored session:", error);
    }
  }

  private async saveSession(user: User, token: string) {
    try {
      await AsyncStorage.setItem("currentUser", JSON.stringify(user));
      await AsyncStorage.setItem("authToken", token);
      this.currentUser = user;
      this.token = token;
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  }

  private async clearSession() {
    try {
      await AsyncStorage.removeItem("currentUser");
      await AsyncStorage.removeItem("authToken");
      this.currentUser = null;
      this.token = null;
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<AuthResponse>> {
    await delay(800);

    // Find user by email
    const user = mockUsers.find((u) => u.email === email);

    // Check credentials (password is hardcoded as "password123" in mock data)
    if (!user || password !== "password123") {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return {
        success: false,
        error: "Your account has been suspended. Please contact support.",
      };
    }

    // Generate auth token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;

    // Save session
    await this.saveSession(user, token);

    // Get user's wallet
    const wallet = getMockWalletByUser(user.id);

    return {
      success: true,
      data: {
        user: {
          ...user,
          bccWallet: wallet,
        },
        token,
        refreshToken: `mock-refresh-token-${user.id}`,
      },
    };
  }

  async register(userData: Partial<User>): Promise<ApiResponse<AuthResponse>> {
    await delay(1000);

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === userData.email);

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || "",
      email: userData.email || "",
      roll: userData.roll || "",
      password: userData.password || "",
      phoneNumber: userData.phoneNumber,
      selfie: userData.selfie,
      idCardFront: userData.idCardFront,
      idCardBack: userData.idCardBack,
      ipAddress: userData.ipAddress,
      latitude: userData.latitude,
      longitude: userData.longitude,
      role: (userData.role as Role) || ("USER" as Role),
      emailVerified: false,
      isVerified: VerifyStatus.UNVERIFIED,
      brittooVerified: false,
      otp: undefined,
      otpExpiry: undefined,
      otpSentCount: 0,
      lastOtpSentDate: undefined,
      securityScore: SecurityScore.MID,
      isSuspended: false,
      suspensionCount: 0,
      suspensionReasons: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
      isValidRuetMail: userData.email?.endsWith("@student.ruet.ac.bd") || false,
    };

    // Generate auth token
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;

    // Save session
    await this.saveSession(newUser, token);

    return {
      success: true,
      data: {
        user: newUser,
        token,
        refreshToken: `mock-refresh-token-${newUser.id}`,
      },
    };
  }

  async logout(): Promise<ApiResponse<void>> {
    await delay(300);
    await this.clearSession();
    return { success: true };
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    await delay(200);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get fresh user data with relations
    const user = mockUsers.find((u) => u.id === this.currentUser!.id);
    const wallet = getMockWalletByUser(this.currentUser.id);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: {
        ...user,
        bccWallet: wallet,
        rentedOutProducts: getMockProductsByOwner(user.id),
        rentalRequestsMade: getMockRentalRequestsByUser(user.id).filter(
          (r) => r.requesterId === user.id,
        ),
        rentalRequestsReceived: getMockRentalRequestsByUser(user.id).filter(
          (r) => r.ownerId === user.id,
        ),
        purchaseRequestsMade: getMockPurchaseRequestsByUser(user.id).filter(
          (p) => p.buyerId === user.id,
        ),
        purchaseRequestsReceived: getMockPurchaseRequestsByUser(user.id).filter(
          (p) => p.sellerId === user.id,
        ),
        buyerChats: getMockChatRoomsByUser(user.id).filter(
          (c) => c.buyerId === user.id,
        ),
        sellerChats: getMockChatRoomsByUser(user.id).filter(
          (c) => c.sellerId === user.id,
        ),
        userNotifications: getMockNotificationsByUser(user.id),
      },
    };
  }

  async updateProfile(
    userId: string,
    data: Partial<User>,
  ): Promise<ApiResponse<User>> {
    await delay(500);

    if (!this.currentUser || this.currentUser.id !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const updatedUser = {
      ...this.currentUser,
      ...data,
      updatedAt: new Date(),
    };

    await this.saveSession(updatedUser, this.token!);

    return {
      success: true,
      data: updatedUser,
    };
  }

  // ============================================
  // PRODUCTS
  // ============================================

  async getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isAvailable?: boolean;
    ownerId?: string;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }>
  > {
    await delay(600);

    let products = [...mockProducts];

    // Filter out deleted products
    products = products.filter((p) => !p.deletedAt);

    // Apply filters
    if (params?.category) {
      products = products.filter((p) => p.productType === params.category);
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.productDescription.toLowerCase().includes(searchLower) ||
          p.tags.toLowerCase().includes(searchLower),
      );
    }

    if (params?.minPrice) {
      products = products.filter(
        (p) => (p.pricePerDay || 0) >= params.minPrice!,
      );
    }

    if (params?.maxPrice) {
      products = products.filter(
        (p) => (p.pricePerDay || 0) <= params.maxPrice!,
      );
    }

    if (params?.isAvailable !== undefined) {
      products = products.filter((p) => p.isAvailable === params.isAvailable);
    }

    if (params?.ownerId) {
      products = products.filter((p) => p.ownerId === params.ownerId);
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = products.slice(start, end);
    const totalPages = Math.ceil(products.length / limit);

    // Add owner and reviews to each product
    const productsWithDetails = paginatedProducts.map((product) => ({
      ...product,
      owner: getMockUserById(product.ownerId),
      reviews: getMockReviewsByProduct(product.id),
      averageRating: getAverageRating(product.id),
    }));

    return {
      success: true,
      data: {
        products: productsWithDetails,
        total: products.length,
        page,
        totalPages,
      },
    };
  }

  async getProductById(id: string): Promise<ApiResponse<ProductResponse>> {
    await delay(400);

    const product = mockProducts.find((p) => p.id === id);

    if (!product || product.deletedAt) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    const owner = getMockUserById(product.ownerId);
    const reviews = getMockReviewsByProduct(product.id);
    const averageRating = getAverageRating(product.id);

    if (!owner) {
      return {
        success: false,
        error: "Product owner not found",
      };
    }

    return {
      success: true,
      data: {
        product: {
          ...product,
          owner,
          reviews,
        },
        owner,
        reviews,
        averageRating,
      },
    };
  }

  async getUserProducts(userId: string): Promise<ApiResponse<Product[]>> {
    await delay(400);

    const products = getMockProductsByOwner(userId);
    const productsWithDetails = products.map((product) => ({
      ...product,
      owner: getMockUserById(product.ownerId),
      reviews: getMockReviewsByProduct(product.id),
    }));

    return {
      success: true,
      data: productsWithDetails,
    };
  }

  // ============================================
  // RENTAL REQUESTS
  // ============================================

  async getRentalRequests(params?: {
    status?: RentalRequestStatus;
    asRenter?: boolean;
    asOwner?: boolean;
  }): Promise<ApiResponse<RentalRequest[]>> {
    await delay(500);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    let requests = getMockRentalRequestsByUser(this.currentUser.id);

    if (params?.status) {
      requests = requests.filter((r) => r.status === params.status);
    }

    // Add relations
    const requestsWithDetails = requests.map((request) => ({
      ...request,
      product: getMockProductById(request.productId),
      owner: getMockUserById(request.ownerId),
      requester: getMockUserById(request.requesterId),
    }));

    return {
      success: true,
      data: requestsWithDetails,
    };
  }

  async createRentalRequest(
    data: Partial<RentalRequest>,
  ): Promise<ApiResponse<RentalRequest>> {
    await delay(800);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const product = mockProducts.find((p) => p.id === data.productId);

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    if (!product.isAvailable) {
      return {
        success: false,
        error: "Product is not available for rent",
      };
    }

    const totalDays =
      data.rentalStartDate && data.rentalEndDate
        ? Math.ceil(
            (new Date(data.rentalEndDate).getTime() -
              new Date(data.rentalStartDate).getTime()) /
              86400000,
          )
        : data.totalDays || 1;

    const newRequest: RentalRequest = {
      id: `rental-${Date.now()}`,
      productId: data.productId!,
      requesterId: this.currentUser.id,
      ownerId: product.ownerId,
      status: RentalRequestStatus.REQUESTED_BY_RENTER,
      totalDays,
      isHourlyRental: data.isHourlyRental || false,
      renterCollectionMethod: (data.renterCollectionMethod ??
        "HOME") as CollectionOrDepositMethod,
      renterPhoneNumber:
        data.renterPhoneNumber || this.currentUser.phoneNumber || "",
      rentalStartDate: data.rentalStartDate || new Date(),
      rentalEndDate: data.rentalEndDate || new Date(),
      paidWithRcc: data.paidWithRcc || false,
      paidWithBcc: data.paidWithBcc || false,
      rccProductSubmitted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    // In a real app, this would be saved to a database
    // For mock, we'll just return the created request

    return {
      success: true,
      data: newRequest,
    };
  }

  async updateRentalRequestStatus(
    id: string,
    status: RentalRequestStatus,
    reason?: string,
  ): Promise<ApiResponse<RentalRequest>> {
    await delay(500);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Find the request (in a real app, this would be from database)
    const request = mockRentalRequests.find((r) => r.id === id);

    if (!request) {
      return {
        success: false,
        error: "Rental request not found",
      };
    }

    // Check permissions
    if (
      status === RentalRequestStatus.ACCEPTED_BY_OWNER ||
      status === RentalRequestStatus.REJECTED_BY_OWNER
    ) {
      if (request.ownerId !== this.currentUser.id) {
        return {
          success: false,
          error: "Only the owner can accept or reject requests",
        };
      }
    } else if (status === RentalRequestStatus.CANCELLED_BY_RENTER) {
      if (request.requesterId !== this.currentUser.id) {
        return {
          success: false,
          error: "Only the renter can cancel the request",
        };
      }
    }

    const updatedRequest = {
      ...request,
      status,
      rejectReason: reason,
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: updatedRequest,
    };
  }

  // ============================================
  // PURCHASE REQUESTS
  // ============================================

  async getPurchaseRequests(params?: {
    status?: PurchaseRequestStatus;
    asBuyer?: boolean;
    asSeller?: boolean;
  }): Promise<ApiResponse<PurchaseRequest[]>> {
    await delay(500);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    let requests = getMockPurchaseRequestsByUser(this.currentUser.id);

    if (params?.status) {
      requests = requests.filter((r) => r.status === params.status);
    }

    const requestsWithDetails = requests.map((request) => ({
      ...request,
      product: getMockProductById(request.productId),
      buyer: getMockUserById(request.buyerId),
      seller: getMockUserById(request.sellerId),
    }));

    return {
      success: true,
      data: requestsWithDetails,
    };
  }

  async createPurchaseRequest(
    data: Partial<PurchaseRequest>,
  ): Promise<ApiResponse<PurchaseRequest>> {
    await delay(800);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const product = mockProducts.find((p) => p.id === data.productId);

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    const askingPrice = data.askingPrice || product.askingPrice || 0;
    const dealPrice = data.dealPrice || askingPrice;
    const platformCharge = dealPrice * 0.05;

    const newRequest: PurchaseRequest = {
      id: `purchase-${Date.now()}`,
      productId: data.productId!,
      buyerId: this.currentUser.id,
      sellerId: product.ownerId,
      status: PurchaseRequestStatus.REQUESTED_BY_BUYER,
      paymentStatus: PurchaseRequestPaymentStatus.PENDING,
      askingPrice,
      dealPrice,
      totalPrice: dealPrice + platformCharge,
      platformCharge,
      buyerCollectionMethod: (data.buyerCollectionMethod ??
        "HOME") as CollectionOrDepositMethod,
      buyerPhoneNumber:
        data.buyerPhoneNumber || this.currentUser.phoneNumber || "",
      sellerPhoneNumber: data.sellerPhoneNumber || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    return {
      success: true,
      data: newRequest,
    };
  }

  // ============================================
  // WALLET
  // ============================================

  async getWallet(): Promise<ApiResponse<BccWallet>> {
    await delay(300);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const wallet = getMockWalletByUser(this.currentUser.id);

    if (!wallet) {
      return {
        success: false,
        error: "Wallet not found",
      };
    }

    return {
      success: true,
      data: wallet,
    };
  }

  async getTransactions(params?: {
    type?: BccTransactionType;
    limit?: number;
  }): Promise<ApiResponse<BccTransaction[]>> {
    await delay(400);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    let transactions = mockBccTransactions.filter(
      (t) => t.userId === this.currentUser!.id,
    );

    if (params?.type) {
      transactions = transactions.filter(
        (t) => t.transactionType === params.type,
      );
    }

    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (params?.limit) {
      transactions = transactions.slice(0, params.limit);
    }

    return {
      success: true,
      data: transactions,
    };
  }

  async getRedCacheCredits(): Promise<ApiResponse<RedCacheCredit[]>> {
    await delay(300);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const credits = mockRedCacheCredits.filter(
      (c) => c.userId === this.currentUser!.id,
    );

    return {
      success: true,
      data: credits,
    };
  }

  async purchaseCredits(
    amount: number,
    gateway: PaymentGateway,
    phoneNumber?: string,
  ): Promise<ApiResponse<BccTransaction>> {
    await delay(1000);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const wallet = getMockWalletByUser(this.currentUser.id);

    if (!wallet) {
      return {
        success: false,
        error: "Wallet not found",
      };
    }

    const transaction: BccTransaction = {
      id: `trx-${Date.now()}`,
      userId: this.currentUser.id,
      walletId: wallet.id,
      amount,
      paymentGateway: gateway,
      transactionId: `TRX-${Date.now()}`,
      numberUsedInTrx: phoneNumber,
      transactionType: BccTransactionType.PURCHASE_BCC,
      status: "ACCEPTED" as BccStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: transaction,
    };
  }

  // ============================================
  // CHAT
  // ============================================

  async getChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    await delay(400);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const rooms = getMockChatRoomsByUser(this.currentUser.id);

    const roomsWithDetails = rooms.map((room) => ({
      ...room,
      product: getMockProductById(room.productId),
      buyer: getMockUserById(room.buyerId),
      seller: getMockUserById(room.sellerId),
      messages: mockMessages.filter((m) => m.chatRoomId === room.id),
    }));

    return {
      success: true,
      data: roomsWithDetails,
    };
  }

  async getMessages(chatRoomId: string): Promise<ApiResponse<Message[]>> {
    await delay(300);

    const messages = mockMessages.filter((m) => m.chatRoomId === chatRoomId);
    messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return {
      success: true,
      data: messages,
    };
  }

  async sendMessage(
    chatRoomId: string,
    content: string,
  ): Promise<ApiResponse<Message>> {
    await delay(200);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatRoomId,
      senderId: this.currentUser.id,
      content,
      isRead: false,
      createdAt: new Date(),
    };

    return {
      success: true,
      data: newMessage,
    };
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  async getNotifications(params?: {
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<ApiResponse<UserNotification[]>> {
    await delay(300);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    let notifications = getMockNotificationsByUser(this.currentUser.id);

    if (params?.unreadOnly) {
      notifications = notifications.filter((n) => !n.isRead);
    }

    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (params?.limit) {
      notifications = notifications.slice(0, params.limit);
    }

    return {
      success: true,
      data: notifications,
    };
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    await delay(200);
    return { success: true };
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    await delay(300);
    return { success: true };
  }

  async getUnreadNotificationCount(): Promise<ApiResponse<number>> {
    await delay(200);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const notifications = getMockNotificationsByUser(this.currentUser.id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      success: true,
      data: unreadCount,
    };
  }

  // ============================================
  // SEARCH
  // ============================================

  async searchProducts(
    query: string,
    filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  ): Promise<ApiResponse<Product[]>> {
    await delay(500);

    let results = [...mockProducts];

    if (query) {
      const searchLower = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.productDescription.toLowerCase().includes(searchLower) ||
          p.tags.toLowerCase().includes(searchLower),
      );
    }

    if (filters?.category) {
      results = results.filter((p) => p.productType === filters.category);
    }

    if (filters?.minPrice) {
      results = results.filter(
        (p) => (p.pricePerDay || 0) >= filters.minPrice!,
      );
    }

    if (filters?.maxPrice) {
      results = results.filter(
        (p) => (p.pricePerDay || 0) <= filters.maxPrice!,
      );
    }

    const resultsWithDetails = results.map((product) => ({
      ...product,
      owner: getMockUserById(product.ownerId),
    }));

    return {
      success: true,
      data: resultsWithDetails,
    };
  }

  // ============================================
  // COUPONS
  // ============================================

  async validateCoupon(code: string): Promise<ApiResponse<Coupon>> {
    await delay(300);

    const coupon = mockCoupons.find(
      (c) => c.code === code && c.isActive && new Date() < c.expiresAt,
    );

    if (!coupon) {
      return {
        success: false,
        error: "Invalid or expired coupon",
      };
    }

    return {
      success: true,
      data: coupon,
    };
  }

  // ============================================
  // STATISTICS
  // ============================================

  async getUserStats(): Promise<
    ApiResponse<{
      totalProducts: number;
      totalRentals: number;
      totalPurchases: number;
      totalSpent: number;
      totalEarned: number;
      activeRentals: number;
    }>
  > {
    await delay(400);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const userProducts = getMockProductsByOwner(this.currentUser.id);
    const userRentals = getMockRentalRequestsByUser(this.currentUser.id);
    const userPurchases = getMockPurchaseRequestsByUser(this.currentUser.id);

    const completedRentals = userRentals.filter(
      (r) => r.status === RentalRequestStatus.PRODUCT_RETURNED_TO_OWNER,
    );
    const activeRentals = userRentals.filter(
      (r) => r.status === RentalRequestStatus.PRODUCT_COLLECTED_BY_RENTER,
    );

    const totalSpent = completedRentals.reduce(
      (sum, r) => sum + (r.pricePerDay || 0) * r.totalDays,
      0,
    );
    const totalEarned = userProducts.reduce(
      (sum, p) => sum + (p.pricePerDay || 0),
      0,
    );

    return {
      success: true,
      data: {
        totalProducts: userProducts.length,
        totalRentals: userRentals.length,
        totalPurchases: userPurchases.length,
        totalSpent,
        totalEarned,
        activeRentals: activeRentals.length,
      },
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUserSync(): User | null {
    return this.currentUser;
  }
}

export const mockDataService = new MockDataService();
