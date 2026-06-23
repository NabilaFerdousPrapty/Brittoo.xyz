// app/(app)/index.tsx (or HomeScreen.tsx)
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Categories from your UI mockup
const categories = [
  {
    name: "Musical Instruments",
    icon: "musical-notes-outline",
    color: "#10b981",
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

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        {/* Header with logo and actions - only logo remains */}
        <View className="px-5 pt-4 pb-3 flex-row justify-between items-center bg-white border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="bg-emerald-50 p-1.5 rounded-xl mr-2">
              <Image
                source={require("../assets/images/brittoo-logo.png")}
                style={{ width: 88, height: 38 }}
                resizeMode="contain"
              />
            </View>
          </View>
          {/* <View className="flex-row gap-5">
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
          </View> */}
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

        {/* Categories Section - Improved Grid */}
        <View className="mt-6 px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Browse Categories
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
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
                    pathname: "/(auth)/login",
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
            onPress={() => router.push("/(auth)/login")}
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
            onPress={() => router.push("/(auth)/login")}
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
            onPress={() => router.push("/")}
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
