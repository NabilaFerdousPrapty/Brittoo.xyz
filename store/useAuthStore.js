import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authApi } from "../services/auth";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      // Restore session on app boot
      restoreSession: async () => {
        try {
          const token = get().token; // already rehydrated by persist
          if (token) {
            const res = await authApi.getCurrentUser();
            set({ user: res.data, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Actions
      signIn: async (token, user) => {
        set({ token, user, isAuthenticated: true, isLoading: false });
        // AsyncStorage write is handled automatically by persist middleware
      },

      signOut: async () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (user) => {
        set({ user });
      },

      refreshUser: async () => {
        try {
          const res = await authApi.getCurrentUser();
          set({ user: res.data });
          return res.data;
        } catch {
          return null;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, user: state.user }), // only persist token + user
    },
  ),
);

export default useAuthStore;
