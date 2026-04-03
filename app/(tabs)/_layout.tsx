import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../../store/useAuthStore";

export default function TabsLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if already authenticated
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-item"
        options={{
          title: "Sell",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Hide these from tab bar but make them accessible */}
      <Tabs.Screen
        name="my-listings"
        options={{
          href: null,
          title: "My Listings",
        }}
      />
      <Tabs.Screen
        name="my-rentals"
        options={{
          href: null,
          title: "My Rentals",
        }}
      />
      <Tabs.Screen
        name="my-purchases"
        options={{
          href: null,
          title: "My Purchases",
        }}
      />
      <Tabs.Screen
        name="my-reviews"
        options={{
          href: null,
          title: "My Reviews",
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          href: null,
          title: "Wallet",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: "Settings",
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          href: null,
          title: "Support",
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          href: null,
          title: "About",
        }}
      />
    </Tabs>
  );
}
