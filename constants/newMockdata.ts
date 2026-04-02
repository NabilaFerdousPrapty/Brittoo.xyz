// mockData.ts
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import {
  BccStatus,
  BccTransaction,
  BccTransactionType,
  BccWallet,
  BrittoTerminal,
  ChatRoom,
  CollectionOrDepositMethod,
  Coupon,
  Message,
  PasswordResetToken,
  PaymentGateway,
  Product,
  ProductCondition,
  ProductType,
  PurchaseRequest,
  PurchaseRequestPaymentStatus,
  PurchaseRequestStatus,
  PushSubscription,
  RedCacheCredit,
  RentalRequest,
  RentalRequestRccUsage,
  RentalRequestStatus,
  Review,
  Role,
  SecurityScore,
  SentNotification,
  User,
  UserNotification,
  VerifyStatus,
  WithdrawalRequest,
  WithdrawalStatus,
} from "../types/brittoo.types";

// ============================================
// HELPER FUNCTIONS
// ============================================

const getRandomDate = (startDaysAgo: number, endDaysAgo: number = 0): Date => {
  const start = Date.now() - startDaysAgo * 86400000;
  const end = Date.now() - endDaysAgo * 86400000;
  return new Date(start + Math.random() * (end - start));
};

const getRandomImageUrl = (id: string, index: number): string => {
  return `https://api.brittoo.com/uploads/products/${id}-${index}.jpg`;
};

// ============================================
// USERS (50)
// ============================================

// constants/mockData.ts - Update the user generation

export const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => {
  const id = uuidv4();
  const roles: Role[] = [Role.USER, Role.ADMIN, Role.MODERATOR];
  const securityScores: SecurityScore[] = [
    SecurityScore.VERY_LOW,
    SecurityScore.LOW,
    SecurityScore.MID,
    SecurityScore.HIGH,
    SecurityScore.VERY_HIGH,
  ];
  const verifyStatuses: VerifyStatus[] = [
    VerifyStatus.UNVERIFIED,
    VerifyStatus.VERIFIED,
    VerifyStatus.PENDING,
    VerifyStatus.REJECTED,
    VerifyStatus.BLOCKED,
  ];

  const roll = `RUET${String(1901001 + i).slice(-7)}`;
  const names = [
    "Rahman",
    "Hasan",
    "Iqbal",
    "Rahim",
    "Riyad",
    "Al Hasan",
    "Das",
    "Mortaza",
    "Ahmed",
    "Rahman",
  ];

  return {
    id,
    name: `${names[i % 10]} ${Math.floor(i / 10) + 1}`,
    email: `${roll.replace("RUET", "").toLowerCase()}@student.ruet.ac.bd`,
    roll,
    password: "password123",
    phoneNumber: `017${String(10000000 + i).slice(-8)}`,
    selfie:
      i % 3 === 0
        ? `https://api.brittoo.com/uploads/selfies/${id}.jpg`
        : undefined,
    idCardFront:
      i % 2 === 0
        ? `https://api.brittoo.com/uploads/id-cards/${id}-front.jpg`
        : undefined,
    idCardBack:
      i % 2 === 0
        ? `https://api.brittoo.com/uploads/id-cards/${id}-back.jpg`
        : undefined,
    ipAddress: `192.168.${Math.floor(i / 250)}.${i % 250}`,
    latitude: 24.9045 + (Math.random() - 0.5) * 0.1,
    longitude: 91.8687 + (Math.random() - 0.5) * 0.1,
    role: roles[i % 3],
    emailVerified: i % 5 !== 0,
    isVerified: verifyStatuses[i % 5],
    brittooVerified: i % 3 === 0,
    otp: i % 10 === 0 ? "123456" : undefined,
    otpExpiry: i % 10 === 0 ? new Date(Date.now() + 300000) : undefined,
    otpSentCount: Math.floor(Math.random() * 5),
    lastOtpSentDate: i % 10 === 0 ? getRandomDate(30, 1) : undefined,
    securityScore: securityScores[i % 5],
    // CHANGE THIS: Make users suspended only if i > 0 and i % 20 === 0
    isSuspended: i > 0 && i % 20 === 0,
    suspensionCount:
      i > 0 && i % 20 === 0 ? Math.floor(Math.random() * 3) + 1 : 0,
    suspensionReasons:
      i > 0 && i % 20 === 0
        ? ["Violation of community guidelines", "Spam activity"]
        : [],
    createdAt: getRandomDate(365, 30),
    updatedAt: new Date(),
    deletedAt: i % 50 === 0 ? new Date() : undefined,
    isValidRuetMail: true,
  };
});
// ============================================
// PASSWORD RESET TOKENS (50)
// ============================================

export const mockPasswordResetTokens: PasswordResetToken[] = Array.from(
  { length: 50 },
  (_, i) => ({
    id: uuidv4(),
    token: `reset-token-${Math.random().toString(36).substring(2)}`,
    userId: mockUsers[i % mockUsers.length].id,
    used: i % 5 === 0,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: getRandomDate(30, 1),
    user: mockUsers[i % mockUsers.length],
  }),
);

// ============================================
// PRODUCTS (50)
// ============================================

const productTypes: ProductType[] = [
  ProductType.GADGET,
  ProductType.FURNITURE,
  ProductType.VEHICLE,
  ProductType.STATIONARY,
  ProductType.MUSICAL_INSTRUMENT,
  ProductType.CLOTHING,
  ProductType.BOOK,
  ProductType.ACADEMIC_BOOK,
  ProductType.ELECTRONICS,
  ProductType.APARTMENTS,
  ProductType.OTHERS,
];

const productConditions: ProductCondition[] = [
  ProductCondition.NEW,
  ProductCondition.LIKE_NEW,
  ProductCondition.GOOD,
  ProductCondition.FAIR,
  ProductCondition.POOR,
];

const productNames = [
  "iPhone 14 Pro Max",
  "Samsung Galaxy S23",
  "Dell XPS Laptop",
  "Study Table",
  "Mountain Bike",
  "Acoustic Guitar",
  "Physics Textbook",
  "Calculus Book",
  "Hoodie Jacket",
  "Mechanical Keyboard",
  "Gaming Mouse",
  'Monitor 24"',
  "Desk Lamp",
  "Office Chair",
  "Printer",
  "Headphones",
  "Smart Watch",
  "Tablet",
  "Camera",
  "Tripod",
];

export const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => {
  const id = uuidv4();
  const ownerId = mockUsers[i % mockUsers.length].id;
  const isForSaleOnly = i % 3 === 0;
  const hasHourlyRental = i % 4 === 0;
  const imageCount = Math.floor(Math.random() * 5) + 1;

  const product: Product = {
    id,
    productSlNo: i + 1,
    productSL: `PRD-${String(i + 1).padStart(5, "0")}`,
    name: `${productNames[i % productNames.length]} ${Math.floor(i / 10) + 1}`,
    pricePerDay: !isForSaleOnly
      ? Math.floor(Math.random() * 1000) + 50
      : undefined,
    pricePerHour: hasHourlyRental
      ? Math.floor(Math.random() * 100) + 10
      : undefined,
    productImages: Array.from({ length: imageCount }, (_, idx) =>
      getRandomImageUrl(id, idx),
    ),
    optimizedImages: Array.from(
      { length: imageCount },
      (_, idx) =>
        `https://api.brittoo.com/uploads/products/optimized/${id}-${idx}.webp`,
    ),
    productType: productTypes[i % productTypes.length],
    productCondition: productConditions[i % productConditions.length],
    productAge: Math.floor(Math.random() * 36),
    omv: Math.floor(Math.random() * 50000) + 1000,
    secondHandPrice: Math.floor(Math.random() * 30000) + 500,
    tags: `tag1, tag2, tag${i % 10}`,
    productDescription: `This is a great ${productNames[i % productNames.length]} in ${productConditions[i % productConditions.length]} condition. Perfect for students! Features include high quality and durability.`,
    quantity: Math.floor(Math.random() * 10) + 1,
    ownerId,
    isOnHold: i % 10 === 0,
    holdStartDate: i % 10 === 0 ? new Date() : undefined,
    holdEndDate: i % 10 === 0 ? new Date(Date.now() + 86400000) : undefined,
    isAvailable: i % 7 !== 0,
    isForSaleOnly,
    askingPrice: isForSaleOnly
      ? Math.floor(Math.random() * 50000) + 1000
      : undefined,
    minPrice: isForSaleOnly
      ? Math.floor(Math.random() * 20000) + 500
      : undefined,
    isForSale: i % 5 !== 0,
    isAiEnabled: i % 3 === 0,
    scale: Math.floor(Math.random() * 10) + 1,
    isRented: i % 8 === 0,
    isBrittooVerified: i % 4 === 0,
    holdCreditValidity:
      i % 10 === 0 ? Math.floor(Math.random() * 30) + 1 : undefined,
    isVirtual: i % 20 === 0,
    virtualType: i % 20 === 0 ? "digital_product" : undefined,
    latitude: 24.9045 + (Math.random() - 0.5) * 0.1,
    longitude: 91.8687 + (Math.random() - 0.5) * 0.1,
    createdAt: getRandomDate(180, 30),
    updatedAt: new Date(),
    deletedAt: i % 50 === 0 ? new Date() : undefined,
    // Relations (will be populated by service layer)
    owner: mockUsers.find((u) => u.id === ownerId),
    redCacheCredits: undefined,
    rentalRequests: undefined,
    renters: undefined,
    chatRooms: undefined,
    purchaseRequests: undefined,
    reviews: [],
  };

  return product;
});

// ============================================
// BCC WALLETS (50)
// ============================================

export const mockBccWallets: BccWallet[] = mockUsers.map((user, i) => ({
  id: uuidv4(),
  userId: user.id,
  availableBalance: Math.floor(Math.random() * 10000) + 100,
  lockedBalance: Math.floor(Math.random() * 1000),
  requestedForWithdrawal: Math.floor(Math.random() * 500),
  createdAt: getRandomDate(365, 30),
  updatedAt: new Date(),
  deletedAt: i % 50 === 0 ? new Date() : undefined,
  user,
  bccTransactions: undefined,
  rentalRequests: undefined,
  withdrawalRequests: undefined,
}));

// ============================================
// BCC TRANSACTIONS (50)
// ============================================

const transactionTypes: BccTransactionType[] = [
  BccTransactionType.RENT_DEPOSIT,
  BccTransactionType.DEPOSIT_REFUND,
  BccTransactionType.BONUS_CREDIT,
  BccTransactionType.PURCHASE_BCC,
  BccTransactionType.MONEY_WITHDRAWAL,
  BccTransactionType.ADJUSTMENT,
];

const paymentGateways: PaymentGateway[] = [
  PaymentGateway.BKASH,
  PaymentGateway.NAGAD,
  PaymentGateway.ROCKET,
];

const bccStatuses: BccStatus[] = [
  BccStatus.PENDING,
  BccStatus.ACCEPTED,
  BccStatus.REJECTED,
];

export const mockBccTransactions: BccTransaction[] = Array.from(
  { length: 50 },
  (_, i) => {
    const userId = mockUsers[i % mockUsers.length].id;
    const wallet = mockBccWallets.find((w) => w.userId === userId);

    return {
      id: uuidv4(),
      userId,
      walletId: wallet?.id || mockBccWallets[0].id,
      rentalRequestId: i % 3 === 0 ? uuidv4() : undefined,
      amount: Math.floor(Math.random() * 5000) + 100,
      paymentGateway:
        i % 4 === 0 ? paymentGateways[i % paymentGateways.length] : undefined,
      transactionId: `TRX-${Date.now()}-${i}`,
      numberUsedInTrx:
        i % 5 === 0 ? `017${String(10000000 + i).slice(-8)}` : undefined,
      transactionType: transactionTypes[i % transactionTypes.length],
      status: bccStatuses[i % bccStatuses.length],
      rejectReason: i % 10 === 0 ? "Invalid transaction details" : undefined,
      createdAt: getRandomDate(90, 1),
      updatedAt: new Date(),
      deletedAt: i % 50 === 0 ? new Date() : undefined,
      rentalRequest: undefined,
      user: mockUsers.find((u) => u.id === userId),
      wallet,
      withdrawalRequest: undefined, // Fixed: changed from WithdrawalRequest to withdrawalRequest
    };
  },
);

// ============================================
// WITHDRAWAL REQUESTS (50)
// ============================================

const withdrawalStatuses: WithdrawalStatus[] = [
  WithdrawalStatus.PENDING,
  WithdrawalStatus.REJECTED,
  WithdrawalStatus.COMPLETED,
];

export const mockWithdrawalRequests: WithdrawalRequest[] = Array.from(
  { length: 50 },
  (_, i) => {
    const userId = mockUsers[i % mockUsers.length].id;
    const wallet = mockBccWallets.find((w) => w.userId === userId);

    return {
      id: uuidv4(),
      userId,
      walletId: wallet?.id || mockBccWallets[0].id,
      bccTransactionId:
        i % 2 === 0
          ? mockBccTransactions[i % mockBccTransactions.length].id
          : undefined,
      withdrawalAmount: Math.floor(Math.random() * 2000) + 100,
      paymentGateway: paymentGateways[i % paymentGateways.length],
      phoneNumber: `017${String(10000000 + i).slice(-8)}`,
      status: withdrawalStatuses[i % withdrawalStatuses.length],
      rejectReason: i % 10 === 2 ? "Insufficient balance" : undefined,
      createdAt: getRandomDate(60, 1),
      updatedAt: new Date(),
      deletedAt: i % 50 === 0 ? new Date() : undefined,
      bccTransaction:
        i % 2 === 0
          ? mockBccTransactions[i % mockBccTransactions.length]
          : undefined,
      user: mockUsers.find((u) => u.id === userId),
      wallet,
    };
  },
);

// ============================================
// RED CACHE CREDITS (50)
// ============================================

export const mockRedCacheCredits: RedCacheCredit[] = Array.from(
  { length: 50 },
  (_, i) => {
    const userId = mockUsers[i % mockUsers.length].id;
    const sourceProduct = mockProducts[i % mockProducts.length];

    return {
      id: uuidv4(),
      amount: Math.floor(Math.random() * 5000) + 500,
      inUse: Math.floor(Math.random() * 500),
      renterId:
        i % 3 === 0 ? mockUsers[(i + 5) % mockUsers.length].id : undefined,
      userId,
      sourceProductId: sourceProduct.id,
      isFrozen: i % 10 === 0,
      isGiftCredit: i % 7 === 0,
      validityDate:
        i % 5 !== 0
          ? new Date(Date.now() + Math.random() * 90 * 86400000)
          : undefined,
      giftedBy:
        i % 7 === 0 ? mockUsers[(i + 10) % mockUsers.length].id : undefined,
      giftReason:
        i % 7 === 0
          ? "Referral bonus"
          : i % 7 === 1
            ? "Festival offer"
            : "Loyalty reward",
      createdAt: getRandomDate(180, 30),
      updatedAt: new Date(),
      deletedAt: i % 50 === 0 ? new Date() : undefined,
      sourceProduct,
      user: mockUsers.find((u) => u.id === userId),
      rentalRequestUsages: undefined,
    };
  },
);

// ============================================
// RENTAL REQUESTS (50)
// ============================================

const rentalRequestStatuses: RentalRequestStatus[] = [
  RentalRequestStatus.REQUESTED_BY_RENTER,
  RentalRequestStatus.CANCELLED_BY_RENTER,
  RentalRequestStatus.ACCEPTED_BY_OWNER,
  RentalRequestStatus.REJECTED_BY_OWNER,
  RentalRequestStatus.REJECTED_FROM_BRITTOO,
  RentalRequestStatus.PRODUCT_SUBMITTED_BY_OWNER,
  RentalRequestStatus.PRODUCT_COLLECTED_BY_RENTER,
  RentalRequestStatus.PRODUCT_RETURNED_BY_RENTER,
  RentalRequestStatus.PRODUCT_RETURNED_TO_OWNER,
];

const collectionMethods: CollectionOrDepositMethod[] = [
  CollectionOrDepositMethod.BRITTOO_TERMINAL,
  CollectionOrDepositMethod.HOME,
];

const brittoTerminals: BrittoTerminal[] = [
  BrittoTerminal.CSE_1,
  BrittoTerminal.ADMIN_1,
  BrittoTerminal.BANGABANDHU_HALL_1,
  BrittoTerminal.ZIA_HALL_1,
  BrittoTerminal.LIBRARY_1,
];

export const mockRentalRequests: RentalRequest[] = Array.from(
  { length: 50 },
  (_, i) => {
    const product = mockProducts[i % mockProducts.length];
    const requester = mockUsers[(i + 3) % mockUsers.length];
    const owner =
      mockUsers.find((u) => u.id === product.ownerId) || mockUsers[0];
    const wallet = mockBccWallets.find((w) => w.userId === requester.id);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 1);
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / 86400000,
    );
    const isHourly = i % 4 === 0;
    const totalHours = isHourly
      ? Math.floor(Math.random() * 24) + 1
      : undefined;

    return {
      id: uuidv4(),
      productId: product.id,
      requesterId: requester.id,
      ownerId: owner.id,
      bccWalletId: wallet?.id,
      couponId: i % 5 === 0 ? uuidv4() : undefined,
      status: rentalRequestStatuses[i % rentalRequestStatuses.length],
      rejectReason: i % 8 === 2 ? "Product not available" : undefined,
      brittooRejectReason: i % 10 === 0 ? "Verification failed" : undefined,
      cancelReason: i % 12 === 0 ? "Changed mind" : undefined,
      submissionDeadline: new Date(Date.now() + 86400000),
      rentalStartDate: startDate,
      rentalEndDate: endDate,
      totalDays,
      pricePerDay: !isHourly ? product.pricePerDay : undefined,
      isHourlyRental: isHourly,
      totalHours,
      startingHour: isHourly
        ? `${Math.floor(Math.random() * 24)}:00`
        : undefined,
      pricePerHour: isHourly ? product.pricePerHour : undefined,
      ownerSubmitMethod: collectionMethods[i % collectionMethods.length],
      renterCollectionMethod:
        collectionMethods[(i + 1) % collectionMethods.length],
      ownerPhoneNumber: owner.phoneNumber,
      renterPhoneNumber: requester.phoneNumber || "01700000000",
      renterDeliveryAddress:
        i % 2 === 0 ? "RUET Academic Building, Rajshahi" : undefined,
      renterPickupTerminal:
        i % 2 === 1 ? brittoTerminals[i % brittoTerminals.length] : undefined,
      ownerSubmitAddress: i % 2 === 0 ? "RUET Hall, Rajshahi" : undefined,
      ownerSubmitTerminal:
        i % 2 === 1
          ? brittoTerminals[(i + 1) % brittoTerminals.length]
          : undefined,
      renterReturnMethod: collectionMethods[i % collectionMethods.length],
      renterReturnAddress: i % 3 === 0 ? "RUET Library, Rajshahi" : undefined,
      renterReturnTerminal:
        i % 3 === 1
          ? brittoTerminals[(i + 2) % brittoTerminals.length]
          : undefined,
      ownerReturnReceiveMethod:
        collectionMethods[(i + 1) % collectionMethods.length],
      ownerReturnReceiveAddress:
        i % 4 === 0 ? "RUET CSE Building, Rajshahi" : undefined,
      ownerReturnReceiveTerminal:
        i % 4 === 1
          ? brittoTerminals[(i + 3) % brittoTerminals.length]
          : undefined,
      paidWithRcc: i % 5 === 0,
      paidWithBcc: i % 3 === 0,
      usedBccAmount:
        i % 3 === 0 ? Math.floor(Math.random() * 500) + 100 : undefined,
      rccProductSubmitted: i % 5 === 0 && i % 10 !== 0,
      createdAt: getRandomDate(60, 1),
      updatedAt: new Date(),
      deletedAt: i % 50 === 0 ? new Date() : undefined,
      bccTransactions: undefined,
      rccUsageDetails: undefined,
      bccWallet: wallet,
      owner,
      product,
      requester,
      coupon: undefined,
    };
  },
);

// ============================================
// RENTAL REQUEST RCC USAGE (50)
// ============================================

export const mockRentalRequestRccUsage: RentalRequestRccUsage[] = Array.from(
  { length: 50 },
  (_, i) => {
    const rentalRequest = mockRentalRequests[i % mockRentalRequests.length];
    const redCacheCredit = mockRedCacheCredits[i % mockRedCacheCredits.length];

    return {
      id: uuidv4(),
      rentalRequestId: rentalRequest.id,
      redCacheCreditId: redCacheCredit.id,
      usedAmount: Math.floor(Math.random() * 500) + 50,
      createdAt: getRandomDate(60, 1),
      updatedAt: new Date(),
      redCacheCredit,
      rentalRequest,
    };
  },
);

// ============================================
// PURCHASE REQUESTS (50)
// ============================================

const purchaseRequestStatuses: PurchaseRequestStatus[] = [
  PurchaseRequestStatus.REQUESTED_BY_BUYER,
  PurchaseRequestStatus.CANCELLED_BY_BUYER,
  PurchaseRequestStatus.ACCEPTED_BY_SELLER,
  PurchaseRequestStatus.REJECTED_BY_SELLER,
  PurchaseRequestStatus.REJECTED_FROM_BRITTOO,
  PurchaseRequestStatus.PRODUCT_SUBMITTED_BY_SELLER,
  PurchaseRequestStatus.PRODUCT_COLLECTED_BY_BUYER,
];

const paymentStatuses: PurchaseRequestPaymentStatus[] = [
  PurchaseRequestPaymentStatus.PENDING,
  PurchaseRequestPaymentStatus.COMPLETED,
];

export const mockPurchaseRequests: PurchaseRequest[] = Array.from(
  { length: 50 },
  (_, i) => {
    const product = mockProducts[i % mockProducts.length];
    const buyer = mockUsers[(i + 2) % mockUsers.length];
    const seller =
      mockUsers.find((u) => u.id === product.ownerId) || mockUsers[0];
    const askingPrice =
      product.askingPrice || Math.floor(Math.random() * 30000) + 1000;
    const dealPrice = askingPrice * (0.7 + Math.random() * 0.3);
    const platformCharge = dealPrice * 0.05;

    return {
      id: uuidv4(),
      productId: product.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      status: purchaseRequestStatuses[i % purchaseRequestStatuses.length],
      paymentStatus: paymentStatuses[i % paymentStatuses.length],
      sellerRejectReason: i % 10 === 2 ? "Price too low" : undefined,
      buyerCancelReason: i % 12 === 0 ? "Found better deal" : undefined,
      brittooRejectReason: i % 15 === 0 ? "Verification failed" : undefined,
      askingPrice,
      dealPrice: Math.floor(dealPrice),
      totalPrice: Math.floor(dealPrice + platformCharge),
      platformCharge: Math.floor(platformCharge),
      buyerCollectionMethod: collectionMethods[i % collectionMethods.length],
      sellerDeliveryMethod:
        collectionMethods[(i + 1) % collectionMethods.length],
      buyerPhoneNumber: buyer.phoneNumber || "01700000000",
      sellerPhoneNumber: seller.phoneNumber || "01700000000",
      buyerDeliveryAddress:
        i % 2 === 0 ? "RUET Academic Building, Rajshahi" : undefined,
      buyerPickupTerminal:
        i % 2 === 1 ? brittoTerminals[i % brittoTerminals.length] : undefined,
      sellerDeliveryAddress: i % 3 === 0 ? "RUET Hall, Rajshahi" : undefined,
      sellerDeliveryTerminal:
        i % 3 === 1
          ? brittoTerminals[(i + 1) % brittoTerminals.length]
          : undefined,
      createdAt: getRandomDate(60, 1),
      updatedAt: new Date(),
      deletedAt: i % 50 === 0 ? new Date() : undefined,
      seller,
      product,
      buyer,
    };
  },
);

// ============================================
// COUPONS (50)
// ============================================

const couponCodes = [
  "WELCOME10",
  "SAVE20",
  "RENT15",
  "BRITTOO25",
  "STUDENT30",
  "FIRSTRENT",
  "REFER50",
  "FESTIVE40",
  "FLASH35",
  "EXCLUSIVE45",
];

export const mockCoupons: Coupon[] = Array.from({ length: 50 }, (_, i) => ({
  id: uuidv4(),
  code: `${couponCodes[i % couponCodes.length]}${Math.floor(i / 10) + 1}`,
  discount: Math.floor(Math.random() * 50) + 5,
  expiresAt: new Date(Date.now() + Math.random() * 180 * 86400000),
  isActive: i % 8 !== 0,
  createdAt: getRandomDate(90, 30),
  updatedAt: new Date(),
  rentalRequests: undefined,
}));

// ============================================
// CHAT ROOMS (50)
// ============================================

export const mockChatRooms: ChatRoom[] = Array.from({ length: 50 }, (_, i) => {
  const product = mockProducts[i % mockProducts.length];
  const buyer = mockUsers[(i + 1) % mockUsers.length];
  const seller =
    mockUsers.find((u) => u.id === product.ownerId) || mockUsers[0];

  return {
    id: uuidv4(),
    productId: product.id,
    buyerId: buyer.id,
    sellerId: seller.id,
    isActive: i % 10 !== 0,
    createdAt: getRandomDate(90, 30),
    updatedAt: new Date(),
    product,
    buyer,
    seller,
    messages: undefined,
  };
});

// ============================================
// MESSAGES (50)
// ============================================

const messageContents = [
  "Hi, is this still available?",
  "Yes, it is available.",
  "What is the condition?",
  "Can I get a discount?",
  "When can I pick it up?",
  "Can you deliver?",
  "Is the price negotiable?",
  "I am interested, please hold it for me.",
  "Can you send more photos?",
  "Thank you!",
  "When is the earliest I can get it?",
  "Does it come with warranty?",
  "Can I test it before buying?",
  "What is the return policy?",
  "Is there any damage?",
];

export const mockMessages: Message[] = Array.from({ length: 50 }, (_, i) => {
  const chatRoom = mockChatRooms[i % mockChatRooms.length];
  const sender =
    mockUsers.find(
      (u) => u.id === chatRoom.buyerId || u.id === chatRoom.sellerId,
    ) || mockUsers[0];

  return {
    id: uuidv4(),
    chatRoomId: chatRoom.id,
    senderId: sender.id,
    content: messageContents[i % messageContents.length],
    isRead: i % 3 !== 0,
    createdAt: getRandomDate(30, 1),
    chatRoom,
    sender,
  };
});

// ============================================
// USER NOTIFICATIONS (50)
// ============================================

const notificationTitles = [
  "New Rental Request",
  "Rental Request Accepted",
  "Payment Received",
  "Product Delivered",
  "New Message",
  "Rental Period Ending Soon",
  "Refund Processed",
  "Account Verification Required",
  "Special Offer",
  "System Update",
  "Product Approved",
  "Withdrawal Processed",
  "Credit Expiring Soon",
  "Review Received",
  "Security Alert",
];

export const mockUserNotifications: UserNotification[] = Array.from(
  { length: 50 },
  (_, i) => {
    const user = mockUsers[i % mockUsers.length];

    return {
      id: uuidv4(),
      userId: user.id,
      title: notificationTitles[i % notificationTitles.length],
      body: `This is a notification body for ${notificationTitles[i % notificationTitles.length]}. Please take necessary action.`,
      data: {
        url: `/dashboard/${i % 2 === 0 ? "rentals" : "messages"}`,
        notificationType: i % 5,
        id: uuidv4(),
      },
      isRead: i % 4 !== 0,
      createdAt: getRandomDate(30, 1),
      user,
    };
  },
);

// ============================================
// PUSH SUBSCRIPTIONS (50)
// ============================================

export const mockPushSubscriptions: PushSubscription[] = Array.from(
  { length: 50 },
  (_, i) => {
    const user = mockUsers[i % mockUsers.length];

    return {
      id: uuidv4(),
      userId: user.id,
      endpoint: `https://fcm.googleapis.com/fcm/send/device-${i}-${user.id}`,
      keys: {
        p256dh: `BIPM2cJXjJ3f${i}V7k5QZ8yL3pR9tW6nX1sK4mO7aE2bC0dF5gH8jK1lN4qR7tY0`,
        auth: `qR7tY0uI3oP5aE2bC0dF5gH8jK1lN4qR7tY0uI3oP5aE2b`,
      },
      createdAt: getRandomDate(180, 30),
      updatedAt: new Date(),
      user,
    };
  },
);

// ============================================
// SENT NOTIFICATIONS (50)
// ============================================

export const mockSentNotifications: SentNotification[] = Array.from(
  { length: 50 },
  (_, i) => {
    const targetTypes = ["all", "students", "faculty", "verified-users"];
    const targetUsers = mockUsers
      .slice(0, Math.floor(Math.random() * 20) + 5)
      .map((u) => u.id);

    return {
      id: uuidv4(),
      title: `System Notification ${i + 1}`,
      body: `This is a broadcast notification about important updates to the Brittoo platform. Please check your dashboard for details.`,
      targets: i % 4 === 0 ? "all" : targetUsers.join(","),
      createdAt: getRandomDate(60, 1),
    };
  },
);

// ============================================
// REVIEWS (50)
// ============================================

const ratings = [1, 2, 3, 4, 5];
const comments = [
  "Excellent product, highly recommend!",
  "Good quality, worth the price.",
  "Average product, nothing special.",
  "Not as described, disappointed.",
  "Perfect condition, great seller!",
  "Fast delivery, product is awesome.",
  "Would buy again from this seller.",
  "Product arrived early, very satisfied.",
  "Some minor issues but overall good.",
  "Best purchase ever!",
];

export const mockReviews: Review[] = Array.from({ length: 50 }, (_, i) => {
  const product = mockProducts[i % mockProducts.length];
  const user = mockUsers[(i + 5) % mockUsers.length];

  return {
    id: uuidv4(),
    productId: product.id,
    userId: user.id,
    userName: user.name,
    userAvatar: user.selfie,
    rating: ratings[i % ratings.length],
    comment: comments[i % comments.length],
    date: getRandomDate(90, 1).toISOString(),
  };
});

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getMockUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};

export const getMockProductById = (id: string): Product | undefined => {
  return mockProducts.find((product) => product.id === id);
};

export const getMockRentalRequestsByUser = (
  userId: string,
): RentalRequest[] => {
  return mockRentalRequests.filter(
    (request) => request.requesterId === userId || request.ownerId === userId,
  );
};

export const getMockPurchaseRequestsByUser = (
  userId: string,
): PurchaseRequest[] => {
  return mockPurchaseRequests.filter(
    (request) => request.buyerId === userId || request.sellerId === userId,
  );
};

export const getMockChatRoomsByUser = (userId: string): ChatRoom[] => {
  return mockChatRooms.filter(
    (room) => room.buyerId === userId || room.sellerId === userId,
  );
};

export const getMockNotificationsByUser = (
  userId: string,
): UserNotification[] => {
  return mockUserNotifications.filter(
    (notification) => notification.userId === userId,
  );
};

export const getMockWalletByUser = (userId: string): BccWallet | undefined => {
  return mockBccWallets.find((wallet) => wallet.userId === userId);
};

export const getMockProductsByOwner = (ownerId: string): Product[] => {
  return mockProducts.filter((product) => product.ownerId === ownerId);
};

export const getMockReviewsByProduct = (productId: string): Review[] => {
  return mockReviews.filter((review) => review.productId === productId);
};

export const getAverageRating = (productId: string): number => {
  const reviews = getMockReviewsByProduct(productId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
};

// Populate relations for products
export const populateProductRelations = (): void => {
  mockProducts.forEach((product) => {
    product.owner = getMockUserById(product.ownerId);
    product.reviews = getMockReviewsByProduct(product.id);
    product.rentalRequests = mockRentalRequests.filter(
      (r) => r.productId === product.id,
    );
    product.chatRooms = mockChatRooms.filter((c) => c.productId === product.id);
    product.purchaseRequests = mockPurchaseRequests.filter(
      (p) => p.productId === product.id,
    );
  });
};

// Populate relations for users
export const populateUserRelations = (): void => {
  mockUsers.forEach((user) => {
    user.rentedOutProducts = getMockProductsByOwner(user.id);
    user.borrowedProducts = mockRentalRequests
      .filter(
        (r) =>
          r.requesterId === user.id &&
          r.status === RentalRequestStatus.PRODUCT_COLLECTED_BY_RENTER,
      )
      .map((r) => getMockProductById(r.productId))
      .filter((p): p is Product => p !== undefined);
    user.bccWallet = getMockWalletByUser(user.id);
    user.rentalRequestsMade = mockRentalRequests.filter(
      (r) => r.requesterId === user.id,
    );
    user.rentalRequestsReceived = mockRentalRequests.filter(
      (r) => r.ownerId === user.id,
    );
    user.purchaseRequestsMade = mockPurchaseRequests.filter(
      (p) => p.buyerId === user.id,
    );
    user.purchaseRequestsReceived = mockPurchaseRequests.filter(
      (p) => p.sellerId === user.id,
    );
    user.buyerChats = mockChatRooms.filter((c) => c.buyerId === user.id);
    user.sellerChats = mockChatRooms.filter((c) => c.sellerId === user.id);
    user.userNotifications = getMockNotificationsByUser(user.id);
  });
};

// Initialize all relations
populateProductRelations();
populateUserRelations();

// ============================================
// AGGREGATED DATA EXPORTS
// ============================================

export const mockData = {
  users: mockUsers,
  passwordResetTokens: mockPasswordResetTokens,
  products: mockProducts,
  bccWallets: mockBccWallets,
  bccTransactions: mockBccTransactions,
  withdrawalRequests: mockWithdrawalRequests,
  redCacheCredits: mockRedCacheCredits,
  rentalRequests: mockRentalRequests,
  rentalRequestRccUsage: mockRentalRequestRccUsage,
  purchaseRequests: mockPurchaseRequests,
  coupons: mockCoupons,
  chatRooms: mockChatRooms,
  messages: mockMessages,
  userNotifications: mockUserNotifications,
  pushSubscriptions: mockPushSubscriptions,
  sentNotifications: mockSentNotifications,
  reviews: mockReviews,
};

export default mockData;
