import { create } from "zustand";
import { AuthState, User } from "../types/product.types";

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === "prapty@gmail.com" && password === "123456") {
        const user: User = {
          id: "1",
          name: "Demo User",
          email: "prapty@gmail.com",
          avatar: "https://i.pravatar.cc/150?u=demo",
          rating: 4.5,
          memberSince: "2024-01-01",
        };
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock signup
      const user: User = {
        id: Date.now().toString(),
        name,
        email,
        avatar: "https://i.pravatar.cc/150?u=" + Date.now(),
        rating: 0,
        memberSince: new Date().toISOString().split("T")[0],
      };
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
