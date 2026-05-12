// types/auth.ts
export interface User {
  id: string;
  name: string;
  email: string;
  roll: string;
  isValidRuetMail: boolean;
  emailVerified: boolean;
  latitude?: number | null;
  longitude?: number | null;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
