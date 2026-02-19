import { Stack } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
      <Stack.Screen name="product/[id]" />
    </Stack>
  );
}
