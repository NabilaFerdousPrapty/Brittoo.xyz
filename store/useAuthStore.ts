// store/useAuthStore.ts
import { create } from "zustand";
import { mockDataService } from "../services/mockDataService";
import { User } from "../types/brittoo.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await mockDataService.login(email, password);

      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error || "Login failed",
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: "An unexpected error occurred",
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await mockDataService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: "Logout failed",
      });
    }
  },

  register: async (userData: Partial<User>) => {
    set({ isLoading: true, error: null });

    try {
      const response = await mockDataService.register(userData);

      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error || "Registration failed",
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: "An unexpected error occurred",
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
