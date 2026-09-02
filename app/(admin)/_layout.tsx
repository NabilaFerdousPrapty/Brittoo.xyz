import { Redirect, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { STORAGE_KEYS } from "../../constants";

type GuardState = "checking" | "allowed" | "unauthenticated" | "forbidden";

type StoredUser = {
  role?: string;
};

export default function AdminLayout() {
  const [guardState, setGuardState] = useState<GuardState>("checking");

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      try {
        const [token, storedUserJson] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.TOKEN),
          SecureStore.getItemAsync(STORAGE_KEYS.USER),
        ]);

        if (!active) return;

        if (!token || !storedUserJson) {
          setGuardState("unauthenticated");
          return;
        }

        let storedUser: StoredUser;

        try {
          storedUser = JSON.parse(storedUserJson) as StoredUser;
        } catch {
          await Promise.all([
            SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN),
            SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
          ]);

          if (active) setGuardState("unauthenticated");
          return;
        }

        if (storedUser.role !== "ADMIN") {
          setGuardState("forbidden");
          return;
        }

        setGuardState("allowed");
      } catch (error) {
        console.error("Admin access check failed:", error);
        if (active) setGuardState("unauthenticated");
      }
    };

    checkAccess();

    return () => {
      active = false;
    };
  }, []);

  if (guardState === "checking") {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#111827" />
        <Text className="mt-3 text-sm text-gray-400">
          Checking administrator access...
        </Text>
      </View>
    );
  }

  if (guardState === "unauthenticated") {
    return <Redirect href="/(auth)/login" />;
  }

  if (guardState === "forbidden") {
    return <Redirect href="/dashboard" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#ffffff" },
        animation: "ios_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="user-detail" />
      <Stack.Screen name="user-credits" />
      <Stack.Screen name="user-requests" />
      <Stack.Screen name="rental-requests" />
      <Stack.Screen name="purchase-requests" />
      <Stack.Screen name="products" />
      <Stack.Screen name="chatroom"/>
      <Stack.Screen name="chats/[chatRoomId]"/>
      
    </Stack>
  );
}
