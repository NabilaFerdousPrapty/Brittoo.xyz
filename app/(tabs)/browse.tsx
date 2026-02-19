import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AuthModal from "../../components/common/AuthModal";
import Button from "../../components/common/Button";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, []);

  const handleLogin = () => {
    setShowAuthModal(false);
    router.push("/(auth)/login");
  };

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
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-green-500 pt-12 pb-8 px-4">
        <View className="items-center">
          <Image
            source={{ uri: user?.avatar }}
            className="w-24 h-24 rounded-full border-4 border-white"
          />
          <Text className="text-2xl font-bold text-white mt-4">
            {user?.name}
          </Text>
          <Text className="text-green-100 mt-1">{user?.email}</Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-yellow-300 text-lg">★</Text>
            <Text className="text-white ml-1">{user?.rating.toFixed(1)}</Text>
            <Text className="text-green-200 ml-2">
              Member since {user?.memberSince}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row bg-white p-4 mt-4">
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-green-600">12</Text>
          <Text className="text-gray-600">Items Rented</Text>
        </View>
        <View className="flex-1 items-center border-l border-r border-gray-200">
          <Text className="text-2xl font-bold text-green-600">5</Text>
          <Text className="text-gray-600">Items Listed</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-green-600">24</Text>
          <Text className="text-gray-600">Reviews</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View className="bg-white mt-4 p-4">
        <Text className="text-lg font-semibold mb-4">Account Settings</Text>

        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <Text className="text-2xl mr-3">📋</Text>
          <Text className="flex-1 text-gray-800">My Listings</Text>
          <Text className="text-gray-400">→</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <Text className="text-2xl mr-3">📅</Text>
          <Text className="flex-1 text-gray-800">My Bookings</Text>
          <Text className="text-gray-400">→</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <Text className="text-2xl mr-3">❤️</Text>
          <Text className="flex-1 text-gray-800">Favorites</Text>
          <Text className="text-gray-400">→</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
          <Text className="text-2xl mr-3">⚙️</Text>
          <Text className="flex-1 text-gray-800">Settings</Text>
          <Text className="text-gray-400">→</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-3">
          <Text className="text-2xl mr-3">📞</Text>
          <Text className="flex-1 text-gray-800">Support</Text>
          <Text className="text-gray-400">→</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View className="p-4 mt-4">
        <Button title="Logout" variant="danger" onPress={logout} size="lg" />
      </View>
    </ScrollView>
  );
}
