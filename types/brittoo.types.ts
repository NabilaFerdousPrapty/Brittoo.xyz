// ============================================
// ENUMS
// ============================================

export enum VerifyStatus {
  UNVERIFIED = "UNVERIFIED",
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  BLOCKED = "BLOCKED",
}

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}

export enum SecurityScore {
  VERY_LOW = "VERY_LOW",
  LOW = "LOW",
  MID = "MID",
  HIGH = "HIGH",
  VERY_HIGH = "VERY_HIGH",
}

export enum BccTransactionType {
  RENT_DEPOSIT = "RENT_DEPOSIT",
  DEPOSIT_REFUND = "DEPOSIT_REFUND",
  BONUS_CREDIT = "BONUS_CREDIT",
  PURCHASE_BCC = "PURCHASE_BCC",
  MONEY_WITHDRAWAL = "MONEY_WITHDRAWAL",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum BccStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export enum PaymentGateway {
  BKASH = "BKASH",
  NAGAD = "NAGAD",
  ROCKET = "ROCKET",
}

export enum WithdrawalStatus {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
}

export enum BrittoTerminal {
  CSE_1 = "CSE_1",
  ADMIN_1 = "ADMIN_1",
  BANGABANDHU_HALL_1 = "BANGABANDHU_HALL_1",
  ZIA_HALL_1 = "ZIA_HALL_1",
  LIBRARY_1 = "LIBRARY_1",
}

export enum ProductType {
  GADGET = "GADGET",
  FURNITURE = "FURNITURE",
  VEHICLE = "VEHICLE",
  STATIONARY = "STATIONARY",
  MUSICAL_INSTRUMENT = "MUSICAL_INSTRUMENT",
  CLOTHING = "CLOTHING",
  BOOK = "BOOK",
  ACADEMIC_BOOK = "ACADEMIC_BOOK",
  ELECTRONICS = "ELECTRONICS",
  APARTMENTS = "APARTMENTS",
  OTHERS = "OTHERS",
}

export enum ProductCondition {
  NEW = "NEW",
  LIKE_NEW = "LIKE_NEW",
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR",
}

export enum CollectionOrDepositMethod {
  BRITTOO_TERMINAL = "BRITTOO_TERMINAL",
  HOME = "HOME",
}

export enum RentalRequestStatus {
  REQUESTED_BY_RENTER = "REQUESTED_BY_RENTER",
  CANCELLED_BY_RENTER = "CANCELLED_BY_RENTER",
  ACCEPTED_BY_OWNER = "ACCEPTED_BY_OWNER",
  REJECTED_BY_OWNER = "REJECTED_BY_OWNER",
  REJECTED_FROM_BRITTOO = "REJECTED_FROM_BRITTOO",
  PRODUCT_SUBMITTED_BY_OWNER = "PRODUCT_SUBMITTED_BY_OWNER",
  PRODUCT_COLLECTED_BY_RENTER = "PRODUCT_COLLECTED_BY_RENTER",
  PRODUCT_RETURNED_BY_RENTER = "PRODUCT_RETURNED_BY_RENTER",
  PRODUCT_RETURNED_TO_OWNER = "PRODUCT_RETURNED_TO_OWNER",
}

export enum PurchaseRequestStatus {
  REQUESTED_BY_BUYER = "REQUESTED_BY_BUYER",
  CANCELLED_BY_BUYER = "CANCELLED_BY_BUYER",
  ACCEPTED_BY_SELLER = "ACCEPTED_BY_SELLER",
  REJECTED_BY_SELLER = "REJECTED_BY_SELLER",
  REJECTED_FROM_BRITTOO = "REJECTED_FROM_BRITTOO",
  PRODUCT_SUBMITTED_BY_SELLER = "PRODUCT_SUBMITTED_BY_SELLER",
  PRODUCT_COLLECTED_BY_BUYER = "PRODUCT_COLLECTED_BY_BUYER",
}

export enum PurchaseRequestPaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

// ============================================
// MODEL TYPES
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  roll: string;
  password: string;
  phoneNumber?: string;
  selfie?: string;
  idCardFront?: string;
  idCardBack?: string;
  ipAddress?: string;
  latitude?: number;
  longitude?: number;
  role: Role;
  emailVerified: boolean;
  isVerified: VerifyStatus;
  brittooVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  otpSentCount: number;
  lastOtpSentDate?: Date;
  securityScore: SecurityScore;
  isSuspended: boolean;
  suspensionCount: number;
  suspensionReasons: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isValidRuetMail: boolean;

  // Relations
  bccTransactions?: BccTransaction[];
  bccWallet?: BccWallet;
  passwordResetToken?: PasswordResetToken;
  rentedOutProducts?: Product[];
  redCacheCredits?: RedCacheCredit[];
  rentalRequestsReceived?: RentalRequest[];
  rentalRequestsMade?: RentalRequest[];
  withdrawalRequests?: WithdrawalRequest[];
  borrowedProducts?: Product[];
  purchaseRequestsReceived?: PurchaseRequest[];
  purchaseRequestsMade?: PurchaseRequest[];
  buyerChats?: ChatRoom[];
  sellerChats?: ChatRoom[];
  sentMessages?: Message[];
  pushSubscriptions?: PushSubscription[];
  userNotifications?: UserNotification[];
}

export interface PasswordResetToken {
  id: string;
  token: string;
  userId: string;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
  user?: User;
}

export interface BccWallet {
  id: string;
  userId: string;
  availableBalance: number;
  lockedBalance: number;
  requestedForWithdrawal: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Relations
  bccTransactions?: BccTransaction[];
  user?: User;
  rentalRequests?: RentalRequest[];
  withdrawalRequests?: WithdrawalRequest[];
}

export interface BccTransaction {
  id: string;
  userId: string;
  walletId: string;
  rentalRequestId?: string;
  amount: number;
  paymentGateway?: PaymentGateway;
  transactionId?: string;
  numberUsedInTrx?: string;
  transactionType: BccTransactionType;
  status?: BccStatus;
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Relations
  rentalRequest?: RentalRequest;
  user?: User;
  wallet?: BccWallet;
  WithdrawalRequest?: WithdrawalRequest;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  walletId: string;
  bccTransactionId?: string;
  withdrawalAmount: number;
  paymentGateway: PaymentGateway;
  phoneNumber: string;
  status: WithdrawalStatus;
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Relations
  bccTransaction?: BccTransaction;
  user?: User;
  wallet?: BccWallet;
}

export interface RedCacheCredit {
  id: string;
  amount: number;
  inUse: number;
  renterId?: string;
  userId: string;
  sourceProductId: string;
  isFrozen: boolean;
  isGiftCredit: boolean;
  validityDate?: Date;
  giftedBy?: string;
  giftReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Relations
  sourceProduct?: Product;
  user?: User;
  rentalRequestUsages?: RentalRequestRccUsage[];
}

export interface Product {
  id: string;
  productSlNo: number;
  productSL: string;
  name: string;
  pricePerDay?: number;
  pricePerHour?: number;
  productImages: string[];
  optimizedImages: string[];
  productType: ProductType;
  productCondition: ProductCondition;
  productAge: number;
  omv: number;
  secondHandPrice: number;
  tags: string;
  productDescription: string;
  quantity: number;
  ownerId: string;
  isOnHold: boolean;
  holdStartDate?: Date;
  holdEndDate?: Date;
  isAvailable: boolean;
  isForSaleOnly: boolean;
  askingPrice?: number;
  minPrice?: number;
  isForSale: boolean;
  isAiEnabled: boolean;
  scale: number;
  isRented: boolean;
  isBrittooVerified: boolean;
  holdCreditValidity?: number;
  isVirtual: boolean;
  virtualType?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Relations
  owner?: User;
  redCacheCredits?: RedCacheCredit;
  rentalRequests?: RentalRequest[];
  renters?: User[];
  chatRooms?: ChatRoom[];
  purchaseRequests?: PurchaseRequest[];
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  rentalRequests?: RentalRequest[];
}

export interface RentalRequest {
  id: string;
  productId: string;
  requesterId: string;
  ownerId: string;
  bccWalletId?: string;
  couponId?: string;
  status: RentalRequestStatus;
  rejectReason?: string;
  brittooRejectReason?: string;
  cancelReason?: string;
  submissionDeadline?: Date;
  rentalStartDate: Date;
  rentalEndDate: Date;
  totalDays: number;
  pricePerDay?: number;
  isHourlyRental: boolean;
  totalHours?: number;
  startingHour?: string;
  pricePerHour?: number;
  ownerSubmitMethod?: CollectionOrDepositMethod;
  renterCollectionMethod: CollectionOrDepositMethod;
  ownerPhoneNumber?: string;
  renterPhoneNumber: string;
  renterDeliveryAddress?: string;
  renterPickupTerminal?: BrittoTerminal;
  ownerSubmitAddress?: string;
  ownerSubmitTerminal?: BrittoTerminal;
  renterReturnMethod?: CollectionOrDepositMethod;
  renterReturnAddress?: string;
  renterReturnTerminal?: BrittoTerminal;
  ownerReturnReceiveMethod?: CollectionOrDepositMethod;
  ownerReturnReceiveAddress?: string;
  ownerReturnReceiveTerminal?: BrittoTerminal;
  paidWithRcc: boolean;
  paidWithBcc: boolean;
  usedBccAmount?: number;
  rccProductSubmitted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Relations
  bccTransactions?: BccTransaction[];
  rccUsageDetails?: RentalRequestRccUsage[];
  bccWallet?: BccWallet;
  owner?: User;
  product?: Product;
  requester?: User;
  coupon?: Coupon;
}

export interface RentalRequestRccUsage {
  id: string;
  rentalRequestId: string;
  redCacheCreditId: string;
  usedAmount: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  redCacheCredit?: RedCacheCredit;
  rentalRequest?: RentalRequest;
}

export interface PurchaseRequest {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: PurchaseRequestStatus;
  paymentStatus: PurchaseRequestPaymentStatus;
  sellerRejectReason?: string;
  buyerCancelReason?: string;
  brittooRejectReason?: string;
  askingPrice: number;
  dealPrice: number;
  totalPrice: number;
  platformCharge: number;
  buyerCollectionMethod: CollectionOrDepositMethod;
  sellerDeliveryMethod?: CollectionOrDepositMethod;
  buyerPhoneNumber: string;
  sellerPhoneNumber: string;
  buyerDeliveryAddress?: string;
  buyerPickupTerminal?: BrittoTerminal;
  sellerDeliveryAddress?: string;
  sellerDeliveryTerminal?: BrittoTerminal;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Relations
  seller?: User;
  product?: Product;
  buyer?: User;
}

export interface ChatRoom {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  product?: Product;
  buyer?: User;
  seller?: User;
  messages?: Message[];
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;

  // Relations
  chatRoom?: ChatRoom;
  sender?: User;
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: any; // { p256dh: string, auth: string }
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: any; // Optional { url: '/path' } for click action
  isRead: boolean;
  createdAt: Date;

  // Relations
  user?: User;
}

export interface SentNotification {
  id: string;
  title: string;
  body: string;
  targets: string; // 'all' or comma-separated userIds/emails
  createdAt: Date;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ProductResponse {
  product: Product;
  owner: User;
  reviews: Review[];
  averageRating: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Booking {
  id: string;
  productId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

// ============================================
// STORE TYPES
// ============================================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string | null;

  fetchProducts: () => Promise<void>;
  searchProducts: (query: string) => void;
  filterByCategory: (category: string) => void;
  setSelectedProduct: (product: Product | null) => void;
}

export interface WalletState {
  bccWallet: BccWallet | null;
  redCacheCredits: RedCacheCredit[];
  isLoading: boolean;

  fetchWallet: () => Promise<void>;
  fetchCredits: () => Promise<void>;
  purchaseCredits: (
    amount: number,
    gateway: PaymentGateway,
  ) => Promise<boolean>;
  withdrawFunds: (
    amount: number,
    gateway: PaymentGateway,
    phoneNumber: string,
  ) => Promise<boolean>;
}

export interface RentalState {
  rentalRequests: RentalRequest[];
  isLoading: boolean;

  fetchRentalRequests: () => Promise<void>;
  createRentalRequest: (data: Partial<RentalRequest>) => Promise<boolean>;
  updateRentalRequestStatus: (
    id: string,
    status: RentalRequestStatus,
  ) => Promise<boolean>;
  cancelRentalRequest: (id: string, reason: string) => Promise<boolean>;
}

export interface ChatState {
  chatRooms: ChatRoom[];
  messages: Message[];
  activeChatRoom: ChatRoom | null;
  isLoading: boolean;

  fetchChatRooms: () => Promise<void>;
  fetchMessages: (chatRoomId: string) => Promise<void>;
  sendMessage: (chatRoomId: string, content: string) => Promise<boolean>;
  markMessagesAsRead: (chatRoomId: string) => Promise<void>;
}

export interface NotificationState {
  notifications: UserNotification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}
