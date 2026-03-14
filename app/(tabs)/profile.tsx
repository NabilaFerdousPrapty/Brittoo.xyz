import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AuthModal from "../../components/common/AuthModal";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setShowAuthModal(false);
    router.push("/(auth)/login");
  };

  const menuItems = [
    {
      id: "listings",
      icon: "briefcase-outline",
      label: "My Listings",
      count: 5,
      color: "#3B82F6",
    },
    {
      id: "bookings",
      icon: "calendar-outline",
      label: "My Bookings",
      count: 3,
      color: "#8B5CF6",
    },
    {
      id: "favorites",
      icon: "heart-outline",
      label: "Favorites",
      count: 12,
      color: "#EC4899",
    },
    {
      id: "reviews",
      icon: "star-outline",
      label: "Reviews",
      count: 24,
      color: "#F59E0B",
    },
  ];

  const settingsItems = [
    {
      id: "settings",
      icon: "settings-outline",
      label: "Settings",
      badge: null,
    },
    {
      id: "support",
      icon: "headset-outline",
      label: "Support",
      badge: null,
    },
    {
      id: "about",
      icon: "information-circle-outline",
      label: "About",
      badge: null,
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

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={["#059669", "#10B981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-12 pb-8 px-4 rounded-b-3xl"
        >
          <View className="items-center">
            {/* Profile Image with Border */}
            <View className="relative">
              <Image
                source={{ uri: user?.avatar }}
                className="w-28 h-28 rounded-full border-4 border-white"
              />
              <View className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-white">
                <Ionicons name="camera" size={14} color="white" />
              </View>
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
                  {user?.rating.toFixed(1)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={16} color="#E5E7EB" />
                <Text className="text-white ml-1">{user?.memberSince}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View className="flex-row justify-between px-4 -mt-6">
          {[
            {
              label: "Items Rented",
              value: "12",
              icon: "cart-outline",
              color: "#3B82F6",
            },
            {
              label: "Items Listed",
              value: "5",
              icon: "pricetag-outline",
              color: "#8B5CF6",
            },
            {
              label: "Reviews",
              value: "24",
              icon: "chatbubble-outline",
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
                      {item.count} items
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
              >
                <View className="w-8 h-8 items-center justify-center mr-3">
                  <Ionicons name={item.icon as any} size={22} color="#6B7280" />
                </View>
                <Text className="flex-1 text-gray-800 text-base">
                  {item.label}
                </Text>
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
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
