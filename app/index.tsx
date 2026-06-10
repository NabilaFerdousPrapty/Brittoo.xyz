// app/(app)/index.tsx (or HomeScreen.tsx)
import Button from "@/components/common/Button";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types for the rental selection
interface SelectedProduct {
  id: string;
  name: string;
  pricePerUnit: number; // in credits (CC)
  image?: string;
}

export default function HomeScreen() {
  // Demo state for the rental calculator
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct] = useState<SelectedProduct>({
    id: "1",
    name: "Canon EOS 1500D DSLR Camera",
    pricePerUnit: 1328,
  });

  // Demo wallet balances (these would come from your store/context)
  const blueCreditBalance = 5000;
  const redCreditBalance = 1328;
  const blueInUse = 0;
  const refundPending = 0;

  const totalRequired = selectedProduct.pricePerUnit * quantity;
  const totalCredits = blueCreditBalance + redCreditBalance;
  const remainingAfterRent = totalCredits - totalRequired;
  const hasSufficientCredits = totalCredits >= totalRequired;

  // Categories from your UI mockup
  const categories = [
    {
      name: "Musical Instruments",
      icon: "musical-notes-outline",
      color: "#10b981", // green
    },
    { name: "Clothing", icon: "shirt-outline", color: "#059669" },
    { name: "Books", icon: "book-outline", color: "#047857" },
    { name: "Academic Books", icon: "library-outline", color: "#0d9488" },
    { name: "Electronics", icon: "phone-portrait-outline", color: "#10b981" },
    { name: "Apartments", icon: "home-outline", color: "#34d399" },
    { name: "Gadgets", icon: "watch-outline", color: "#6ee7b7" },
    { name: "Furniture", icon: "bed-outline", color: "#059669" },
    { name: "Vehicles", icon: "car-outline", color: "#10b981" },
    { name: "Stationary", icon: "create-outline", color: "#047857" },
    { name: "Music", icon: "headset-outline", color: "#34d399" },
  ];

  const handleQuantityChange = (increment: boolean) => {
    setQuantity((prev) => Math.max(1, increment ? prev + 1 : prev - 1));
  };

  const handleRentNow = () => {
    // Navigate to checkout/rental confirmation
    router.push("/(rental)/checkout");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        {/* Header with logo and actions - Clean white design */}
        <View className="px-5 pt-4 pb-3 flex-row justify-between items-center bg-white border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="bg-emerald-50 p-1.5 rounded-xl mr-2">
              <Image
                source={require("../assets/images/brittoo-logo.png")}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-emerald-600 text-2xl font-bold tracking-tight">
              Brittoo
            </Text>
          </View>
          <View className="flex-row gap-5">
            <TouchableOpacity
              onPress={() => router.push("/(app)/notifications")}
              className="relative"
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#374151"
              />
              <View className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(app)/profile")}>
              <Ionicons
                name="person-circle-outline"
                size={26}
                color="#374151"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero / Tagline - Enhanced with gradient-like effect */}
        <View className="px-5 pt-8 pb-6 bg-white">
          <Text className="text-3xl font-extrabold text-gray-900 leading-9">
            Own Less,{" "}
            <Text className="text-emerald-500 relative">
              Access More
              <View className="absolute bottom-0 left-0 right-0 h-2 bg-emerald-100 -z-10" />
            </Text>
          </Text>
          <Text className="text-gray-500 text-base mt-3 leading-6">
            Rent, Barter, and Share items in your community. Earn credits by
            lending your items or pay with cash.
          </Text>
        </View>

        {/* Featured Rental Preview Card - New Interactive Section */}
        <View className="px-5 mt-2">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-900">
              🔥 Featured Rental
            </Text>
            <TouchableOpacity onPress={() => router.push("/(browse)/featured")}>
              <Text className="text-emerald-600 text-sm font-semibold">
                View all
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <View className="p-5">
              <View className="flex-row items-start">
                <View className="bg-emerald-50 w-20 h-20 rounded-xl items-center justify-center">
                  <Ionicons name="camera-outline" size={40} color="#10b981" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-gray-900 font-bold text-lg mb-1">
                    {selectedProduct.name}
                  </Text>
                  <Text className="text-emerald-600 font-bold text-xl">
                    {selectedProduct.pricePerUnit} CC
                  </Text>
                  <Text className="text-gray-400 text-xs">per day</Text>
                </View>
              </View>

              {/* Quantity Selector */}
              <View className="flex-row items-center justify-between mt-5 pt-4 border-t border-gray-100">
                <Text className="text-gray-700 font-medium">Quantity</Text>
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(false)}
                    className="bg-gray-100 w-9 h-9 rounded-full items-center justify-center active:bg-gray-200"
                  >
                    <Ionicons name="remove" size={20} color="#374151" />
                  </TouchableOpacity>
                  <Text className="text-gray-900 font-bold text-lg w-8 text-center">
                    {quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(true)}
                    className="bg-emerald-500 w-9 h-9 rounded-full items-center justify-center active:bg-emerald-600 shadow-sm"
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Credits Info */}
              <View className="mt-4 pt-3 bg-gray-50 rounded-xl p-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 text-sm">Total Required</Text>
                  <Text className="text-gray-900 font-bold">
                    {totalRequired} CC
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 text-sm">Your Credits</Text>
                  <View className="flex-row gap-3">
                    <Text className="text-blue-600 font-medium">
                      💙 {blueCreditBalance}
                    </Text>
                    <Text className="text-red-500 font-medium">
                      ❤️ {redCreditBalance}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between pt-2 border-t border-gray-200">
                  <Text className="text-gray-600 text-sm">
                    Remaining after rent
                  </Text>
                  <Text
                    className={`font-bold ${remainingAfterRent >= 0 ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {remainingAfterRent} CC
                  </Text>
                </View>
              </View>

              <Button
                title="Rent Now"
                onPress={handleRentNow}
                variant="primary"
                size="lg"
                className="mt-4"
                disabled={!hasSufficientCredits}
              />
              {!hasSufficientCredits && (
                <Text className="text-red-500 text-xs text-center mt-2">
                  Insufficient credits. Please top up.
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Categories Section - Improved Grid */}
        <View className="mt-8 px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Browse Categories
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(browse)/categories")}
              className="flex-row items-center gap-1"
            >
              <Text className="text-emerald-600 text-sm font-semibold">
                See All
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#10b981" />
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {categories.slice(0, 8).map((category, idx) => (
              <TouchableOpacity
                key={idx}
                className="w-[23%] bg-white rounded-2xl p-3 items-center mb-4 shadow-md border border-gray-50 active:scale-95 transition-all"
                onPress={() =>
                  router.push({
                    pathname: "/(products)",
                    params: { category: category.name },
                  })
                }
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mb-2 shadow-inner"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={28}
                    color={category.color}
                  />
                </View>
                <Text className="text-gray-700 text-xs text-center font-semibold">
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions - Find Items & List Items */}
        <View className="px-5 mt-4 flex-row gap-4">
          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl p-5 shadow-lg border border-gray-50 flex-row items-center active:scale-95 transition-all"
            onPress={() => router.push("/(browse)/search")}
          >
            <View className="bg-emerald-100 p-2 rounded-full">
              <Ionicons name="search-outline" size={24} color="#10b981" />
            </View>
            <View className="ml-3">
              <Text className="font-extrabold text-gray-900 text-base">
                Find Items
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">
                Search nearby products
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 shadow-lg flex-row items-center active:scale-95 transition-all"
            onPress={() => router.push("/(listing)/create")}
          >
            <View className="bg-white/20 p-2 rounded-full">
              <Ionicons name="add-circle-outline" size={24} color="white" />
            </View>
            <View className="ml-3">
              <Text className="font-extrabold text-white text-base">
                List Items
              </Text>
              <Text className="text-emerald-100 text-xs mt-0.5">
                Earn red credits
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* How It Works - Enhanced Card */}
        <View className="mx-5 mt-8 bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 shadow-md border border-emerald-100">
          <View className="flex-row items-center mb-3">
            <View className="bg-emerald-500 p-2 rounded-full mr-3">
              <Ionicons name="flash-outline" size={20} color="white" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              A Smarter Way to Share & Earn
            </Text>
          </View>
          <Text className="text-gray-600 text-sm leading-6 mb-5">
            With Brittoo, you can rent using credits, earn by sharing unused
            items, top up your credits whenever needed, and withdraw earnings
            with ease.
          </Text>
          <TouchableOpacity
            className="flex-row items-center self-start bg-emerald-500 px-5 py-2.5 rounded-full shadow-sm active:opacity-80"
            onPress={() => router.push("/(info)/how-it-works")}
          >
            <Text className="text-white font-semibold mr-2">Learn more</Text>
            <Ionicons name="arrow-forward-circle" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
