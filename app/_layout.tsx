import { Stack } from "expo-router";
// 1. Import the Provider instead of the View here
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../store/useAuthStore";

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
        <Stack.Screen name="product/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
