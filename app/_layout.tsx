import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

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

        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/verify-otp" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/reset-password" />
        <Stack.Screen name="(auth)/verify-identity" />
        <Stack.Screen name="dashboard" />
        {/* Product screens */}
        <Stack.Screen name="(products)/index" />
        <Stack.Screen name="(products)/[id]" />
        <Stack.Screen name="(products)/create" />
        <Stack.Screen name="(products)/edit" />
      </Stack>
    </>
  );
}
