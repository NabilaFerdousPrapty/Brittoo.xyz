// app/(app)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  { name: "Instruments", icon: "musical-notes-outline", color: "#6B7280" },
  { name: "Apparel", icon: "shirt-outline", color: "#6B7280" },
  { name: "Books", icon: "book-outline", color: "#6B7280" },
  { name: "Electronics", icon: "phone-portrait-outline", color: "#6B7280" },
  { name: "Apartments", icon: "home-outline", color: "#6B7280" },
  { name: "Furniture", icon: "bed-outline", color: "#6B7280" },
];

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        {/* Header */}
        <View className="px-5 pt-5 pb-4 flex-row items-center">
          <Image
            source={require("../assets/images/brittoo-logo.png")}
            style={{ width: 80, height: 32 }}
            resizeMode="contain"
          />
        </View>

        {/* Hero */}
        <View className="px-5 mt-6">
          <Text className="text-3xl font-medium text-gray-800">
            Own less, <Text className="text-emerald-600">access more.</Text>
          </Text>
          <Text className="mt-2 text-gray-500 text-base leading-5">
            Rent, barter, or share within your community.
          </Text>
        </View>

        {/* Categories */}
        <View className="px-5 mt-10">
          <Text className="text-lg font-medium text-gray-800">Browse</Text>
          <View className="flex-row flex-wrap mt-4 -ml-3">
            {categories.map((c) => (
              <TouchableOpacity
                key={c.name}
                className="w-[30%] ml-[2.5%] mb-4 items-center"
                onPress={() => router.push("/(auth)/login")}
              >
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center">
                  <Ionicons name={c.icon as any} size={26} color={c.color} />
                </View>
                <Text className="mt-2 text-xs text-gray-700">{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View className="px-5 mt-8 flex-row gap-4">
          <TouchableOpacity
            className="flex-1 bg-gray-50 rounded-2xl p-4 flex-row items-center"
            onPress={() => router.push("/(auth)/login")}
          >
            <Ionicons name="search-outline" size={22} color="#10b981" />
            <Text className="ml-3 text-gray-800 font-medium">Find items</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={["#10b981", "#059669"]}
            className="flex-1 rounded-2xl"
          >
            <TouchableOpacity
              className="p-4 flex-row items-center"
              onPress={() => router.push("/(auth)/login")}
            >
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
              <Text className="ml-3 text-white font-medium">List items</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* How it works */}
        <View className="mx-5 mt-10 bg-gray-50 rounded-2xl p-5">
          <Text className="text-base font-medium text-gray-800">
            A smarter way to share
          </Text>
          <Text className="mt-2 text-sm text-gray-600 leading-4">
            Lend what you don’t use, earn credits, and withdraw anytime.
          </Text>
          <TouchableOpacity
            className="mt-4 self-start"
            onPress={() => router.push("/")}
          >
            <Text className="text-emerald-600 text-sm font-medium">
              Learn more →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
