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
        {/* Admin screens */}
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(admin)/users" />
        <Stack.Screen name="(admin)/products" />

        <Stack.Screen name="(auth)/signup" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/verify-otp" />
        <Stack.Screen name="(auth)/forgot-password" />

        <Stack.Screen name="(auth)/verify-identity" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="wallet" />
        <Stack.Screen name="how-it-works"/>

        {/* Product screens */}
        <Stack.Screen name="(products)/index" />
        <Stack.Screen name="(products)/[id]" />
        <Stack.Screen name="(products)/create" />
        <Stack.Screen name="(products)/edit" />
      </Stack>
    </>
  );
}
