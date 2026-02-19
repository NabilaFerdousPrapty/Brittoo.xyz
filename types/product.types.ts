export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rating: number;
  memberSince: string;
  phone?: string;
  bio?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: "hour" | "day" | "week" | "month";
  images: string[];
  category: string;
  owner: User;
  location: string;
  rating: number;
  reviewsCount: number;
  available: boolean;
  specs?: Record<string, string>;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
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
  status: "pending" | "confirmed" | "cancelled" | "completed";
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
