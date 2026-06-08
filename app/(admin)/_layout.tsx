import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#ffffff" }, animation: "ios_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="user-detail" />
      <Stack.Screen name="user-credits" />
      <Stack.Screen name="user-requests" />
      <Stack.Screen name="rental-requests" />
      <Stack.Screen name="purchase-requests" />
      <Stack.Screen name="products" />
    </Stack>
  );
}
