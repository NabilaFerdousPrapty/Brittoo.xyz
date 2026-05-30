import { Stack, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { STORAGE_KEYS } from "../constants";
import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      if (!token) {
        router.replace("/");
      }
    } catch {
      router.replace("/");
    }
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ffffff" },
          animation: "ios_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/verify-otp" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/reset-password" />
        <Stack.Screen name="(auth)/verify-identity" />
        <Stack.Screen name="(tabs)/browse.tsx" />
      </Stack>
    </>
  );
}
