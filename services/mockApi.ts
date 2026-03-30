// services/mockDataService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import mockData from "../constants/newMockdata";
import {
  ApiResponse,
  AuthResponse,
  BccTransaction,
  BccTransactionType,
  BccWallet,
  ChatRoom,
  CollectionOrDepositMethod,
  Coupon,
  Message,
  PaymentGateway,
  Product,
  ProductCondition,
  ProductResponse,
  ProductType,
  PurchaseRequest,
  PurchaseRequestPaymentStatus,
  PurchaseRequestStatus,
  RedCacheCredit,
  RentalRequest,
  RentalRequestStatus,
  Review,
  Role,
  SecurityScore,
  User,
  UserNotification,
  VerifyStatus,
  WithdrawalRequest,
} from "../types/brittoo.types";

// Simulate async operations with realistic delays
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

class MockDataService {
  private currentUser: User | null = null;
  private storage: Map<string, any> = new Map();

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage() {
    // Initialize with mock data
    this.storage.set("users", [...mockData.users]);
    this.storage.set("products", [...mockData.products]);
    this.storage.set("rentalRequests", [...mockData.rentalRequests]);
    this.storage.set("purchaseRequests", [...mockData.purchaseRequests]);
    this.storage.set("bccWallets", [...mockData.bccWallets]);
    this.storage.set("bccTransactions", [...mockData.bccTransactions]);
    this.storage.set("withdrawalRequests", [...mockData.withdrawalRequests]);
    this.storage.set("redCacheCredits", [...mockData.redCacheCredits]);
    this.storage.set("chatRooms", [...mockData.chatRooms]);
    this.storage.set("messages", [...mockData.messages]);
    this.storage.set("notifications", [...mockData.userNotifications]);
    this.storage.set("coupons", [...mockData.coupons]);
    this.storage.set("reviews", [...mockData.reviews]);
  }

  // Helper to get current user
  private getCurrentUser(): User | null {
    return this.currentUser;
  }

  private setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      AsyncStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      AsyncStorage.removeItem("currentUser");
    }
  }

  // Load stored user on app start
  async loadStoredUser() {
    const storedUser = await AsyncStorage.getItem("currentUser");
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<AuthResponse>> {
    await delay(500);

    const users = this.storage.get("users") as User[];
    const user = users.find((u) => u.email === email);

    if (!user || password !== "password123") {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    this.setCurrentUser(user);
    const token = `mock-token-${user.id}-${Date.now()}`;

    return {
      success: true,
      data: {
        user,
        token,
        refreshToken: `refresh-${user.id}`,
      },
    };
  }

  async register(userData: Partial<User>): Promise<ApiResponse<AuthResponse>> {
    await delay(800);

    const users = this.storage.get("users") as User[];
    const existingUser = users.find((u) => u.email === userData.email);

    if (existingUser) {
      return {
        success: false,
        error: "User already exists",
      };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || "",
      email: userData.email || "",
      roll: userData.roll || "",
      password: userData.password || "",
      phoneNumber: userData.phoneNumber,
      role: Role.USER,
      emailVerified: false,
      isVerified: VerifyStatus.UNVERIFIED,
      brittooVerified: false,
      otpSentCount: 0,
      securityScore: SecurityScore.MID,
      isSuspended: false,
      suspensionCount: 0,
      suspensionReasons: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isValidRuetMail: userData.email?.endsWith("@student.ruet.ac.bd") || false,
    };

    users.push(newUser);
    this.storage.set("users", users);

    // Create wallet for new user
    const wallets = this.storage.get("bccWallets") as BccWallet[];
    wallets.push({
      id: `wallet-${newUser.id}`,
      userId: newUser.id,
      availableBalance: 0,
      lockedBalance: 0,
      requestedForWithdrawal: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.storage.set("bccWallets", wallets);

    this.setCurrentUser(newUser);
    const token = `mock-token-${newUser.id}-${Date.now()}`;

    return {
      success: true,
      data: {
        user: newUser,
        token,
        refreshToken: `refresh-${newUser.id}`,
      },
    };
  }

  async logout(): Promise<ApiResponse<void>> {
    await delay(200);
    this.setCurrentUser(null);
    return { success: true };
  }

  async getCurrentUserInfo(): Promise<ApiResponse<User>> {
    await delay(200);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get fresh user data
    const users = this.storage.get("users") as User[];
    const user = users.find((u) => u.id === this.currentUser!.id);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: user,
    };
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    await delay(500);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const users = this.storage.get("users") as User[];
    const index = users.findIndex((u) => u.id === this.currentUser!.id);

    if (index === -1) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const updatedUser = {
      ...users[index],
      ...data,
      updatedAt: new Date(),
    };

    users[index] = updatedUser;
    this.storage.set("users", users);
    this.setCurrentUser(updatedUser);

    return {
      success: true,
      data: updatedUser,
    };
  }

  // ============================================
  // PRODUCTS
  // ============================================

  async getProducts(params?: {
    category?: ProductType;
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
    await delay(400);

    let products = this.storage.get("products") as Product[];

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

    return {
      success: true,
      data: {
        products: paginatedProducts,
        total: products.length,
        page,
        totalPages,
      },
    };
  }

  async getProductById(id: string): Promise<ApiResponse<ProductResponse>> {
    await delay(300);

    const products = this.storage.get("products") as Product[];
    const product = products.find((p) => p.id === id);

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    const users = this.storage.get("users") as User[];
    const owner = users.find((u) => u.id === product.ownerId)!;
    const reviews = (this.storage.get("reviews") as Review[]).filter(
      (r) => r.productId === id,
    );
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      success: true,
      data: {
        product,
        owner,
        reviews,
        averageRating,
      },
    };
  }

  async createProduct(
    productData: Partial<Product>,
  ): Promise<ApiResponse<Product>> {
    await delay(600);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const products = this.storage.get("products") as Product[];
    const productSlNo = products.length + 1;

    const newProduct: Product = {
      id: `product-${Date.now()}`,
      productSlNo,
      productSL: `PRD-${String(productSlNo).padStart(5, "0")}`,
      productImages: productData.productImages || [],
      optimizedImages: [],
      productType: productData.productType || ProductType.OTHERS,
      productCondition: productData.productCondition || ProductCondition.GOOD,
      productAge: productData.productAge || 0,
      omv: productData.omv || 0,
      secondHandPrice: productData.secondHandPrice || 0,
      tags: productData.tags || "",
      productDescription: productData.productDescription || "",
      quantity: productData.quantity || 1,
      ownerId: this.currentUser.id,
      isOnHold: false,
      isAvailable: true,
      isForSaleOnly: productData.isForSaleOnly || false,
      isForSale:
        productData.isForSale !== undefined ? productData.isForSale : true,
      isAiEnabled: false,
      scale: 1,
      isRented: false,
      isBrittooVerified: false,
      isVirtual: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...productData,
    };

    products.push(newProduct);
    this.storage.set("products", products);

    return {
      success: true,
      data: newProduct,
    };
  }

  async updateProduct(
    id: string,
    productData: Partial<Product>,
  ): Promise<ApiResponse<Product>> {
    await delay(500);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const products = this.storage.get("products") as Product[];
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    const product = products[index];
    if (product.ownerId !== this.currentUser.id) {
      return {
        success: false,
        error: "You can only update your own products",
      };
    }

    const updatedProduct = {
      ...product,
      ...productData,
      updatedAt: new Date(),
    };

    products[index] = updatedProduct;
    this.storage.set("products", products);

    return {
      success: true,
      data: updatedProduct,
    };
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    await delay(500);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const products = this.storage.get("products") as Product[];
    const product = products.find((p) => p.id === id);

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    if (product.ownerId !== this.currentUser.id) {
      return {
        success: false,
        error: "You can only delete your own products",
      };
    }

    const filteredProducts = products.filter((p) => p.id !== id);
    this.storage.set("products", filteredProducts);

    return { success: true };
  }

  async getUserProducts(userId?: string): Promise<ApiResponse<Product[]>> {
    await delay(300);

    const targetUserId = userId || this.currentUser?.id;

    if (!targetUserId) {
      return {
        success: false,
        error: "User ID required",
      };
    }

    const products = this.storage.get("products") as Product[];
    const userProducts = products.filter((p) => p.ownerId === targetUserId);

    return {
      success: true,
      data: userProducts,
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
    await delay(400);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    let requests = this.storage.get("rentalRequests") as RentalRequest[];

    if (params?.asRenter) {
      requests = requests.filter((r) => r.requesterId === this.currentUser!.id);
    } else if (params?.asOwner) {
      requests = requests.filter((r) => r.ownerId === this.currentUser!.id);
    } else {
      requests = requests.filter(
        (r) =>
          r.requesterId === this.currentUser!.id ||
          r.ownerId === this.currentUser!.id,
      );
    }

    if (params?.status) {
      requests = requests.filter((r) => r.status === params.status);
    }

    // Sort by newest first
    requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      success: true,
      data: requests,
    };
  }

  async getRentalRequestById(id: string): Promise<ApiResponse<RentalRequest>> {
    await delay(300);

    const requests = this.storage.get("rentalRequests") as RentalRequest[];
    const request = requests.find((r) => r.id === id);

    if (!request) {
      return {
        success: false,
        error: "Rental request not found",
      };
    }

    return {
      success: true,
      data: request,
    };
  }

  async createRentalRequest(
    data: Partial<RentalRequest>,
  ): Promise<ApiResponse<RentalRequest>> {
    await delay(600);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const products = this.storage.get("products") as Product[];
    const product = products.find((p) => p.id === data.productId);

    if (!product) {
      return {
        success: false,
        error: "Product not found",
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
      renterCollectionMethod:
        data.renterCollectionMethod || CollectionOrDepositMethod.HOME,
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

    const requests = this.storage.get("rentalRequests") as RentalRequest[];
    requests.push(newRequest);
    this.storage.set("rentalRequests", requests);

    // Create notification for owner
    await this.createNotification({
      userId: product.ownerId,
      title: "New Rental Request",
      body: `${this.currentUser.name} wants to rent your ${product.name}`,
      data: { rentalRequestId: newRequest.id, type: "rental_request" },
    });

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

    const requests = this.storage.get("rentalRequests") as RentalRequest[];
    const index = requests.findIndex((r) => r.id === id);

    if (index === -1) {
      return {
        success: false,
        error: "Rental request not found",
      };
    }

    const request = requests[index];

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

    requests[index] = updatedRequest;
    this.storage.set("rentalRequests", requests);

    // Create notification for the other party
    const targetUserId =
      status === RentalRequestStatus.ACCEPTED_BY_OWNER
        ? request.requesterId
        : request.ownerId;

    const users = this.storage.get("users") as User[];
    const currentUser = users.find((u) => u.id === this.currentUser!.id);

    await this.createNotification({
      userId: targetUserId,
      title: `Rental Request ${status.replace(/_/g, " ").toLowerCase()}`,
      body: `${currentUser?.name} has ${status.replace(/_/g, " ").toLowerCase()} your rental request`,
      data: { rentalRequestId: id, type: "rental_status" },
    });

    return {
      success: true,
      data: updatedRequest,
    };
  }

  async cancelRentalRequest(
    id: string,
    reason: string,
  ): Promise<ApiResponse<RentalRequest>> {
    return this.updateRentalRequestStatus(
      id,
      RentalRequestStatus.CANCELLED_BY_RENTER,
      reason,
    );
  }

  // ============================================
  // PURCHASE REQUESTS
  // ============================================

  async getPurchaseRequests(params?: {
    status?: PurchaseRequestStatus;
    asBuyer?: boolean;
    asSeller?: boolean;
  }): Promise<ApiResponse<PurchaseRequest[]>> {
    await delay(400);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    let requests = this.storage.get("purchaseRequests") as PurchaseRequest[];

    if (params?.asBuyer) {
      requests = requests.filter((r) => r.buyerId === this.currentUser!.id);
    } else if (params?.asSeller) {
      requests = requests.filter((r) => r.sellerId === this.currentUser!.id);
    } else {
      requests = requests.filter(
        (r) =>
          r.buyerId === this.currentUser!.id ||
          r.sellerId === this.currentUser!.id,
      );
    }

    if (params?.status) {
      requests = requests.filter((r) => r.status === params.status);
    }

    requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      success: true,
      data: requests,
    };
  }

  async createPurchaseRequest(
    data: Partial<PurchaseRequest>,
  ): Promise<ApiResponse<PurchaseRequest>> {
    await delay(600);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const products = this.storage.get("products") as Product[];
    const product = products.find((p) => p.id === data.productId);

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
      buyerCollectionMethod:
        data.buyerCollectionMethod || CollectionOrDepositMethod.HOME,
      buyerPhoneNumber:
        data.buyerPhoneNumber || this.currentUser.phoneNumber || "",
      sellerPhoneNumber: data.sellerPhoneNumber || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    const requests = this.storage.get("purchaseRequests") as PurchaseRequest[];
    requests.push(newRequest);
    this.storage.set("purchaseRequests", requests);

    // Create notification for seller
    await this.createNotification({
      userId: product.ownerId,
      title: "New Purchase Request",
      body: `${this.currentUser.name} wants to buy your ${product.name}`,
      data: { purchaseRequestId: newRequest.id, type: "purchase_request" },
    });

    return {
      success: true,
      data: newRequest,
    };
  }

  async updatePurchaseRequestStatus(
    id: string,
    status: PurchaseRequestStatus,
    reason?: string,
  ): Promise<ApiResponse<PurchaseRequest>> {
    await delay(500);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const requests = this.storage.get("purchaseRequests") as PurchaseRequest[];
    const index = requests.findIndex((r) => r.id === id);

    if (index === -1) {
      return {
        success: false,
        error: "Purchase request not found",
      };
    }

    const request = requests[index];

    // Check permissions
    if (
      status === PurchaseRequestStatus.ACCEPTED_BY_SELLER ||
      status === PurchaseRequestStatus.REJECTED_BY_SELLER
    ) {
      if (request.sellerId !== this.currentUser.id) {
        return {
          success: false,
          error: "Only the seller can accept or reject requests",
        };
      }
    } else if (status === PurchaseRequestStatus.CANCELLED_BY_BUYER) {
      if (request.buyerId !== this.currentUser.id) {
        return {
          success: false,
          error: "Only the buyer can cancel the request",
        };
      }
    }

    const updatedRequest = {
      ...request,
      status,
      sellerRejectReason: reason,
      updatedAt: new Date(),
    };

    requests[index] = updatedRequest;
    this.storage.set("purchaseRequests", requests);

    // Create notification
    const targetUserId =
      status === PurchaseRequestStatus.ACCEPTED_BY_SELLER
        ? request.buyerId
        : request.sellerId;

    const users = this.storage.get("users") as User[];
    const currentUser = users.find((u) => u.id === this.currentUser!.id);

    await this.createNotification({
      userId: targetUserId,
      title: `Purchase Request ${status.replace(/_/g, " ").toLowerCase()}`,
      body: `${currentUser?.name} has ${status.replace(/_/g, " ").toLowerCase()} your purchase request`,
      data: { purchaseRequestId: id, type: "purchase_status" },
    });

    return {
      success: true,
      data: updatedRequest,
    };
  }

  // ============================================
  // WALLET & TRANSACTIONS
  // ============================================

  async getWallet(): Promise<ApiResponse<BccWallet>> {
    await delay(300);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const wallets = this.storage.get("bccWallets") as BccWallet[];
    const wallet = wallets.find((w) => w.userId === this.currentUser!.id);

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
    await delay(300);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    let transactions = this.storage.get("bccTransactions") as BccTransaction[];
    transactions = transactions.filter(
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

    const credits = this.storage.get("redCacheCredits") as RedCacheCredit[];
    const userCredits = credits.filter(
      (c) => c.userId === this.currentUser!.id,
    );

    return {
      success: true,
      data: userCredits,
    };
  }

  async purchaseCredits(
    amount: number,
    gateway: PaymentGateway,
    phoneNumber?: string,
  ): Promise<ApiResponse<BccTransaction>> {
    await delay(800);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const wallets = this.storage.get("bccWallets") as BccWallet[];
    const walletIndex = wallets.findIndex(
      (w) => w.userId === this.currentUser!.id,
    );

    if (walletIndex === -1) {
      return {
        success: false,
        error: "Wallet not found",
      };
    }

    const transaction: BccTransaction = {
      id: `trx-${Date.now()}`,
      userId: this.currentUser.id,
      walletId: wallets[walletIndex].id,
      amount,
      paymentGateway: gateway,
      transactionId: `TRX-${Date.now()}`,
      numberUsedInTrx: phoneNumber,
      transactionType: BccTransactionType.PURCHASE_BCC,
      status: BccStatus.ACCEPTED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update wallet balance
    wallets[walletIndex].availableBalance += amount;
    this.storage.set("bccWallets", wallets);

    // Save transaction
    const transactions = this.storage.get(
      "bccTransactions",
    ) as BccTransaction[];
    transactions.push(transaction);
    this.storage.set("bccTransactions", transactions);

    return {
      success: true,
      data: transaction,
    };
  }

  async withdrawFunds(
    amount: number,
    gateway: PaymentGateway,
    phoneNumber: string,
  ): Promise<ApiResponse<WithdrawalRequest>> {
    await delay(800);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const wallets = this.storage.get("bccWallets") as BccWallet[];
    const wallet = wallets.find((w) => w.userId === this.currentUser!.id);

    if (!wallet) {
      return {
        success: false,
        error: "Wallet not found",
      };
    }

    if (wallet.availableBalance < amount) {
      return {
        success: false,
        error: "Insufficient balance",
      };
    }

    const withdrawal: WithdrawalRequest = {
      id: `withdraw-${Date.now()}`,
      userId: this.currentUser.id,
      walletId: wallet.id,
      withdrawalAmount: amount,
      paymentGateway: gateway,
      phoneNumber,
      status: WithdrawalStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Lock the amount
    wallet.requestedForWithdrawal += amount;
    wallet.availableBalance -= amount;
    this.storage.set("bccWallets", wallets);

    const withdrawals = this.storage.get(
      "withdrawalRequests",
    ) as WithdrawalRequest[];
    withdrawals.push(withdrawal);
    this.storage.set("withdrawalRequests", withdrawals);

    return {
      success: true,
      data: withdrawal,
    };
  }

  // ============================================
  // CHAT
  // ============================================

  async getChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    await delay(300);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const rooms = this.storage.get("chatRooms") as ChatRoom[];
    const userRooms = rooms.filter(
      (r) =>
        r.buyerId === this.currentUser!.id ||
        r.sellerId === this.currentUser!.id,
    );

    // Add last message and unread count
    const messages = this.storage.get("messages") as Message[];
    const roomsWithDetails = userRooms.map((room) => {
      const roomMessages = messages.filter((m) => m.chatRoomId === room.id);
      const lastMessage = roomMessages[roomMessages.length - 1];
      const unreadCount = roomMessages.filter(
        (m) => m.senderId !== this.currentUser!.id && !m.isRead,
      ).length;

      return {
        ...room,
        lastMessage,
        unreadCount,
      };
    });

    roomsWithDetails.sort((a, b) => {
      const aTime =
        a.lastMessage?.createdAt?.getTime() || a.createdAt.getTime();
      const bTime =
        b.lastMessage?.createdAt?.getTime() || b.createdAt.getTime();
      return bTime - aTime;
    });

    return {
      success: true,
      data: roomsWithDetails,
    };
  }

  async getMessages(chatRoomId: string): Promise<ApiResponse<Message[]>> {
    await delay(300);

    const messages = this.storage.get("messages") as Message[];
    const roomMessages = messages.filter((m) => m.chatRoomId === chatRoomId);
    roomMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Mark messages as read
    if (this.currentUser) {
      roomMessages.forEach((msg) => {
        if (msg.senderId !== this.currentUser!.id && !msg.isRead) {
          msg.isRead = true;
        }
      });
      this.storage.set("messages", messages);
    }

    return {
      success: true,
      data: roomMessages,
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

    const messages = this.storage.get("messages") as Message[];
    messages.push(newMessage);
    this.storage.set("messages", messages);

    // Update chat room updated time
    const rooms = this.storage.get("chatRooms") as ChatRoom[];
    const roomIndex = rooms.findIndex((r) => r.id === chatRoomId);
    if (roomIndex !== -1) {
      rooms[roomIndex].updatedAt = new Date();
      this.storage.set("chatRooms", rooms);
    }

    // Create notification for the other user
    const room = rooms[roomIndex];
    const otherUserId =
      room.buyerId === this.currentUser.id ? room.sellerId : room.buyerId;

    const users = this.storage.get("users") as User[];
    const currentUser = users.find((u) => u.id === this.currentUser!.id);

    await this.createNotification({
      userId: otherUserId,
      title: "New Message",
      body: `${currentUser?.name}: ${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`,
      data: { chatRoomId, type: "message" },
    });

    return {
      success: true,
      data: newMessage,
    };
  }

  async createChatRoom(
    productId: string,
    buyerId: string,
    sellerId: string,
  ): Promise<ApiResponse<ChatRoom>> {
    await delay(400);

    const rooms = this.storage.get("chatRooms") as ChatRoom[];

    // Check if room already exists
    const existingRoom = rooms.find(
      (r) =>
        r.productId === productId &&
        r.buyerId === buyerId &&
        r.sellerId === sellerId,
    );

    if (existingRoom) {
      return {
        success: true,
        data: existingRoom,
      };
    }

    const newRoom: ChatRoom = {
      id: `chat-${Date.now()}`,
      productId,
      buyerId,
      sellerId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    rooms.push(newRoom);
    this.storage.set("chatRooms", rooms);

    return {
      success: true,
      data: newRoom,
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

    let notifications = this.storage.get("notifications") as UserNotification[];
    notifications = notifications.filter(
      (n) => n.userId === this.currentUser!.id,
    );

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

  async createNotification(
    data: Partial<UserNotification>,
  ): Promise<UserNotification> {
    const notification: UserNotification = {
      id: `notif-${Date.now()}`,
      userId: data.userId!,
      title: data.title!,
      body: data.body!,
      data: data.data,
      isRead: false,
      createdAt: new Date(),
    };

    const notifications = this.storage.get(
      "notifications",
    ) as UserNotification[];
    notifications.push(notification);
    this.storage.set("notifications", notifications);

    return notification;
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    await delay(200);

    const notifications = this.storage.get(
      "notifications",
    ) as UserNotification[];
    const index = notifications.findIndex((n) => n.id === id);

    if (index !== -1) {
      notifications[index].isRead = true;
      this.storage.set("notifications", notifications);
    }

    return { success: true };
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    await delay(300);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const notifications = this.storage.get(
      "notifications",
    ) as UserNotification[];
    notifications.forEach((n) => {
      if (n.userId === this.currentUser!.id) {
        n.isRead = true;
      }
    });
    this.storage.set("notifications", notifications);

    return { success: true };
  }

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    await delay(200);

    const notifications = this.storage.get(
      "notifications",
    ) as UserNotification[];
    const filtered = notifications.filter((n) => n.id !== id);
    this.storage.set("notifications", filtered);

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

    const notifications = this.storage.get(
      "notifications",
    ) as UserNotification[];
    const unreadCount = notifications.filter(
      (n) => n.userId === this.currentUser!.id && !n.isRead,
    ).length;

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
      category?: ProductType;
      minPrice?: number;
      maxPrice?: number;
      condition?: ProductCondition;
    },
  ): Promise<ApiResponse<Product[]>> {
    await delay(400);

    let products = this.storage.get("products") as Product[];

    if (query) {
      const searchLower = query.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.productDescription.toLowerCase().includes(searchLower) ||
          p.tags.toLowerCase().includes(searchLower),
      );
    }

    if (filters?.category) {
      products = products.filter((p) => p.productType === filters.category);
    }

    if (filters?.minPrice) {
      products = products.filter(
        (p) => (p.pricePerDay || 0) >= filters.minPrice!,
      );
    }

    if (filters?.maxPrice) {
      products = products.filter(
        (p) => (p.pricePerDay || 0) <= filters.maxPrice!,
      );
    }

    if (filters?.condition) {
      products = products.filter(
        (p) => p.productCondition === filters.condition,
      );
    }

    return {
      success: true,
      data: products,
    };
  }

  // ============================================
  // COUPONS
  // ============================================

  async validateCoupon(code: string): Promise<ApiResponse<Coupon>> {
    await delay(300);

    const coupons = this.storage.get("coupons") as Coupon[];
    const coupon = coupons.find(
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
  // REVIEWS
  // ============================================

  async getProductReviews(productId: string): Promise<ApiResponse<Review[]>> {
    await delay(300);

    const reviews = this.storage.get("reviews") as Review[];
    const productReviews = reviews.filter((r) => r.productId === productId);
    productReviews.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return {
      success: true,
      data: productReviews,
    };
  }

  async createReview(
    productId: string,
    rating: number,
    comment: string,
  ): Promise<ApiResponse<Review>> {
    await delay(500);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const newReview: Review = {
      id: `review-${Date.now()}`,
      productId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.selfie,
      rating,
      comment,
      date: new Date().toISOString(),
    };

    const reviews = this.storage.get("reviews") as Review[];
    reviews.push(newReview);
    this.storage.set("reviews", reviews);

    return {
      success: true,
      data: newReview,
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
    }>
  > {
    await delay(400);

    if (!this.currentUser) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const products = this.storage.get("products") as Product[];
    const rentals = this.storage.get("rentalRequests") as RentalRequest[];
    const purchases = this.storage.get("purchaseRequests") as PurchaseRequest[];
    const transactions = this.storage.get(
      "bccTransactions",
    ) as BccTransaction[];

    const userProducts = products.filter(
      (p) => p.ownerId === this.currentUser!.id,
    );
    const userRentals = rentals.filter(
      (r) => r.requesterId === this.currentUser!.id,
    );
    const userPurchases = purchases.filter(
      (p) => p.buyerId === this.currentUser!.id,
    );
    const userSales = purchases.filter(
      (p) => p.sellerId === this.currentUser!.id,
    );

    const userTransactions = transactions.filter(
      (t) => t.userId === this.currentUser!.id,
    );
    const totalSpent = userTransactions
      .filter((t) => t.transactionType === BccTransactionType.PURCHASE_BCC)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalEarned = userTransactions
      .filter((t) => t.transactionType === BccTransactionType.RENT_DEPOSIT)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      success: true,
      data: {
        totalProducts: userProducts.length,
        totalRentals: userRentals.length,
        totalPurchases: userPurchases.length,
        totalSpent,
        totalEarned,
      },
    };
  }
}

export const mockDataService = new MockDataService();
