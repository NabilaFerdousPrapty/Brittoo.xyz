import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

export default function RootLayout() {
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

        {/* Tab group */}
        <Stack.Screen name="(tabs)" />

        {/* Admin screens */}
        <Stack.Screen name="(admin)" />

        <Stack.Screen name="(auth)/signup" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/verify-otp" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/verify-identity" />

        <Stack.Screen name="how-it-works" />
        <Stack.Screen name="wallet" />

        {/* Product screens (still full-screen stack, no tab bar) */}
        <Stack.Screen name="(products)" />
      </Stack>
    </>
  );
}