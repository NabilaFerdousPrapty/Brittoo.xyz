import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../store/useAuthStore";

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(auth)"
          options={{
            presentation: "modal",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen name="product/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
