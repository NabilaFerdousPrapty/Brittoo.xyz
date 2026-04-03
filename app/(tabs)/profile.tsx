import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AuthModal from "../../components/common/AuthModal";
import { mockDataService } from "../../services/mockDataService";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRentals: 0,
    totalPurchases: 0,
    totalSpent: 0,
    totalEarned: 0,
    activeRentals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      loadUserStats();
    }
  }, [isAuthenticated]);

  const loadUserStats = async () => {
    try {
      const response = await mockDataService.getUserStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load user stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserStats();
  };

  const handleLogin = () => {
    setShowAuthModal(false);
    router.push("/(auth)/login");
  };

  // Get initials for avatar if no image
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format member since date
  const getMemberSince = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const menuItems: Array<{
    id: string;
    icon: string;
    label: string;
    count: number;
    color: string;
    route:
      | "/(tabs)/my-listings"
      | "/(tabs)/my-rentals"
      | "/(tabs)/my-purchases"
      | "/(tabs)/my-reviews";
  }> = [
    {
      id: "listings",
      icon: "briefcase-outline",
      label: "My Listings",
      count: stats.totalProducts,
      color: "#3B82F6",
      route: "/(tabs)/my-listings",
    },
    {
      id: "bookings",
      icon: "calendar-outline",
      label: "My Rentals",
      count: stats.totalRentals,
      color: "#8B5CF6",
      route: "/(tabs)/my-rentals",
    },
    {
      id: "purchases",
      icon: "cart-outline",
      label: "My Purchases",
      count: stats.totalPurchases,
      color: "#EC4899",
      route: "/(tabs)/my-purchases",
    },
    {
      id: "reviews",
      icon: "star-outline",
      label: "Reviews",
      count: 0,
      color: "#F59E0B",
      route: "/(tabs)/my-reviews",
    },
  ];

  const settingsItems: Array<{
    id: string;
    icon: string;
    label: string;
    badge: string | null;
    route:
      | "/(auth)/edit-profile"
      | "/(tabs)/wallet"
      | "/(tabs)/settings"
      | "/(tabs)/support"
      | "/(tabs)/about";
  }> = [
    {
      id: "profile",
      icon: "person-outline",
      label: "Edit Profile",
      badge: null,
      route: "/(auth)/edit-profile",
    },
    {
      id: "wallet",
      icon: "wallet-outline",
      label: "Wallet & Credits",
      badge: user?.bccWallet?.availableBalance
        ? `৳${user.bccWallet.availableBalance}`
        : null,
      route: "/(tabs)/wallet",
    },
    {
      id: "settings",
      icon: "settings-outline",
      label: "Settings",
      badge: null,
      route: "/(tabs)/settings",
    },
    {
      id: "support",
      icon: "headset-outline",
      label: "Support",
      badge: null,
      route: "/(tabs)/support",
    },
    {
      id: "about",
      icon: "information-circle-outline",
      label: "About",
      badge: null,
      route: "/(tabs)/about",
    },
  ];

  if (!isAuthenticated) {
    return (
      <AuthModal
        visible={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          router.back();
        }}
        message="Please login to view your profile"
      />
    );
  }

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={["#059669", "#10B981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-12 pb-8 px-4 rounded-b-3xl"
        >
          <View className="items-center">
            {/* Profile Image or Initials */}
            <View className="relative">
              {user?.selfie ? (
                <Image
                  source={{ uri: user.selfie }}
                  className="w-28 h-28 rounded-full border-4 border-white"
                />
              ) : (
                <View className="w-28 h-28 rounded-full border-4 border-white bg-green-600 items-center justify-center">
                  <Text className="text-white text-3xl font-bold">
                    {getInitials(user?.name || "User")}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => router.push("/(auth)/edit-profile")}
                className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-white"
              >
                <Ionicons name="camera" size={14} color="white" />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <Text className="text-2xl font-bold text-white mt-4">
              {user?.name}
            </Text>
            <Text className="text-green-100 mt-1">{user?.email}</Text>

            {/* Rating and Member Since */}
            <View className="flex-row items-center mt-3 bg-white/20 px-4 py-2 rounded-full">
              <View className="flex-row items-center mr-4">
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text className="text-white ml-1 font-semibold">
                  {user?.securityScore === "VERY_HIGH"
                    ? "5.0"
                    : user?.securityScore === "HIGH"
                      ? "4.5"
                      : user?.securityScore === "MID"
                        ? "4.0"
                        : user?.securityScore === "LOW"
                          ? "3.0"
                          : "2.0"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={16} color="#E5E7EB" />
                <Text className="text-white ml-1">
                  Member since {getMemberSince(user?.createdAt || new Date())}
                </Text>
              </View>
            </View>

            {/* Verification Badge */}
            {user?.brittooVerified && (
              <View className="mt-3 bg-green-600/30 px-3 py-1 rounded-full">
                <View className="flex-row items-center">
                  <Ionicons name="shield-checkmark" size={14} color="#FBBF24" />
                  <Text className="text-white text-xs ml-1">
                    Verified Member
                  </Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View className="flex-row justify-between px-4 -mt-6">
          {[
            {
              label: "Items Rented",
              value: stats.totalRentals.toString(),
              icon: "cart-outline",
              color: "#3B82F6",
            },
            {
              label: "Items Listed",
              value: stats.totalProducts.toString(),
              icon: "pricetag-outline",
              color: "#8B5CF6",
            },
            {
              label: "Active Rentals",
              value: stats.activeRentals.toString(),
              icon: "time-outline",
              color: "#EC4899",
            },
          ].map((stat, index) => (
            <View
              key={index}
              className="bg-white rounded-xl p-4 flex-1 mx-1 shadow-sm"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="items-center">
                <View className="bg-gray-50 p-2 rounded-full mb-2">
                  <Ionicons
                    name={stat.icon as any}
                    size={20}
                    color={stat.color}
                  />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  {stat.value}
                </Text>
                <Text className="text-xs text-gray-500 text-center mt-1">
                  {stat.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Wallet Balance Card */}
        {user?.bccWallet && (
          <View className="px-4 mt-4">
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/wallet")}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white/80 text-xs">
                    Available Balance
                  </Text>
                  <Text className="text-white text-2xl font-bold mt-1">
                    ৳{user.bccWallet.availableBalance}
                  </Text>
                </View>
                <View className="bg-white/20 rounded-full p-2">
                  <Ionicons name="wallet-outline" size={24} color="white" />
                </View>
              </View>
              <View className="flex-row justify-between mt-3">
                <Text className="text-white/70 text-xs">
                  Locked: ৳{user.bccWallet.lockedBalance}
                </Text>
                <Text className="text-white/70 text-xs">
                  Pending: ৳{user.bccWallet.requestedForWithdrawal}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions Grid */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap -mx-1">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="w-1/2 px-1 mb-2"
                activeOpacity={0.7}
                onPress={() => router.push(item.route)}
              >
                <View
                  className="bg-white p-4 rounded-xl flex-row items-center shadow-sm"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">
                      {item.label}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {item.count} {item.count === 1 ? "item" : "items"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Settings & Support
          </Text>
          <View className="bg-white rounded-xl shadow-sm overflow-hidden">
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center px-4 py-4 ${
                  index !== settingsItems.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
                activeOpacity={0.7}
                onPress={() => router.push(item.route)}
              >
                <View className="w-8 h-8 items-center justify-center mr-3">
                  <Ionicons name={item.icon as any} size={22} color="#6B7280" />
                </View>
                <Text className="flex-1 text-gray-800 text-base">
                  {item.label}
                </Text>
                {item.badge && (
                  <View className="bg-green-100 px-2 py-1 rounded-full mr-2">
                    <Text className="text-green-600 text-xs font-medium">
                      {item.badge}
                    </Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-4 mt-8 mb-8">
          <TouchableOpacity
            onPress={logout}
            className="bg-red-50 py-4 rounded-xl flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 font-semibold ml-2">Logout</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text className="text-center text-gray-400 text-xs mt-4">
            Brittoo v1.0.0
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
