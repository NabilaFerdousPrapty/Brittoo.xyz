// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";

export default function RootLayout() {
  const { loadStoredUser } = useAuthStore();

  useEffect(() => {
    loadStoredUser();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
