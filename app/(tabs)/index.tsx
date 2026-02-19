import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import CategoryCard from "../../components/cards/CategoryCard";
import ProductCard from "../../components/cards/ProductCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { categories } from "../../constants/categories";
import { useProductStore } from "../../store/useProductStore";

export default function HomeScreen() {
  const router = useRouter();
  const { products, isLoading, fetchProducts, filterByCategory } =
    useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const featuredProducts = products.slice(0, 5);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Hero Section with Logo */}
      <View className="px-4 pt-2 pb-2">
        <View className="items-center mb-4">
          <Image
            source={require("../../assets/images/brittoo-logo.png")}
            className="w-40 h-40 mb-0"
            resizeMode="contain"
          />

          <Text className="text-green-700 text-center text-lg">
            Rent what you need, when you need it
          </Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/browse")}
          className="bg-green-400 backdrop-blur-lg rounded-full px-4 py-3 flex-row items-center mt-2"
        >
          <Text className="text-white text-lg mr-2">🔍</Text>
          <Text className="text-white/80 flex-1">
            Search for items to rent...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}

      {/* Categories */}
      <View className="bg-white mt-4 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold">Popular Categories</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}>
            <Text className="text-green-600">See All →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              icon={category.icon}
              color={category.color}
              selected={false}
              onPress={() => {
                filterByCategory(category.name);
                router.push("/(tabs)/browse");
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View className="bg-white mt-4 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-lg font-semibold">Featured Items</Text>
            <Text className="text-gray-500 text-sm">
              Popular rentals this week
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}>
            <Text className="text-green-600">See All →</Text>
          </TouchableOpacity>
        </View>

        {featuredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => router.push(`/product/${product.id}`)}
          />
        ))}
      </View>

      {/* Why Choose Us */}
      <View className="bg-green-50 mt-4 p-6">
        <Text className="text-lg font-semibold text-center mb-6">
          Why Choose Brittoo?
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%] bg-white p-4 rounded-xl mb-3">
            <Text className="text-3xl mb-2">💰</Text>
            <Text className="font-semibold mb-1">Save Money</Text>
            <Text className="text-xs text-gray-600">Rent instead of buy</Text>
          </View>
          <View className="w-[48%] bg-white p-4 rounded-xl mb-3">
            <Text className="text-3xl mb-2">🌱</Text>
            <Text className="font-semibold mb-1">Eco-Friendly</Text>
            <Text className="text-xs text-gray-600">Reduce waste</Text>
          </View>
          <View className="w-[48%] bg-white p-4 rounded-xl">
            <Text className="text-3xl mb-2">🛡️</Text>
            <Text className="font-semibold mb-1">Secure</Text>
            <Text className="text-xs text-gray-600">Verified users</Text>
          </View>
          <View className="w-[48%] bg-white p-4 rounded-xl">
            <Text className="text-3xl mb-2">⚡</Text>
            <Text className="font-semibold mb-1">Quick & Easy</Text>
            <Text className="text-xs text-gray-600">Simple booking</Text>
          </View>
        </View>
      </View>

      {/* How It Works */}
      <View className="bg-white mt-4 p-6">
        <Text className="text-lg font-semibold text-center mb-6">
          How It Works
        </Text>
        <View className="flex-row justify-around">
          <View className="items-center flex-1">
            <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-2">
              <Text className="text-2xl">🔍</Text>
            </View>
            <Text className="text-sm font-medium">Find</Text>
            <Text className="text-xs text-gray-500 text-center px-2">
              Search for items near you
            </Text>
          </View>
          <View className="items-center flex-1">
            <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-2">
              <Text className="text-2xl">📅</Text>
            </View>
            <Text className="text-sm font-medium">Book</Text>
            <Text className="text-xs text-gray-500 text-center px-2">
              Choose your dates
            </Text>
          </View>
          <View className="items-center flex-1">
            <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-2">
              <Text className="text-2xl">🔑</Text>
            </View>
            <Text className="text-sm font-medium">Pickup</Text>
            <Text className="text-xs text-gray-500 text-center px-2">
              Meet & get your item
            </Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View className="bg-green-600 mt-4 p-8 items-center">
        <Text className="text-2xl font-bold text-white text-center mb-2">
          Got something to rent?
        </Text>
        <Text className="text-green-100 text-center mb-4">
          Join our community and earn money from your idle items
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/add-item")}
          className="bg-white px-8 py-3 rounded-full"
        >
          <Text className="text-green-600 font-semibold">Start Earning →</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="p-6 items-center">
        <Image
          source={require("../../assets/images/brittoo-logo.png")}
          className="w-12 h-12 mb-2"
          resizeMode="contain"
        />

        <Text className="text-gray-800 text-xs text-center">
          Rent what you need, when you need it
        </Text>
        <Text className="text-gray-700 text-xs mt-4">
          © 2024 Brittoo. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}
