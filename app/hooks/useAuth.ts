import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../constants";
import { getCurrentUser } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  roll: string;
  role: string;
  emailVerified: boolean;
  isVerified: "UNVERIFIED" | "PENDING" | "VERIFIED";
  brittooVerified: boolean;
  isSuspended: boolean;
  selfie?: string;
  idCardFront?: string;
  isValidRuetMail: boolean;
  securityScore: number;
  createdAt: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      const storedUser = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Refresh user data from server
        const res = await getCurrentUser();
        if (res.data?.data) {
          setUser(res.data.data);
          await SecureStore.setItemAsync(
            STORAGE_KEYS.USER,
            JSON.stringify(res.data.data)
          );
        }
      }
    } catch {
      // Token invalid, clear session
      await clearSession();
    } finally {
      setLoading(false);
    }
  };

  const saveSession = useCallback(async (newToken: string, newUser: User) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, newToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    saveSession,
    clearSession,
    setUser,
  };
};
