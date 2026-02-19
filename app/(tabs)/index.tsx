import BuyCreditsScreen from "@/components/cards/BuyCreditsScreen";
import { LinearGradient } from "expo-linear-gradient";
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

  const featuredProducts = products.slice(0, 6);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      {/* Header & Hero Section */}
      <View className="pb-10">
        <LinearGradient
          colors={["#f0fdf4", "#ffffff"]}
          className="px-6 pt-12 pb-8 rounded-b-[40px]"
        >
          {/* Top Bar */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-gray-500 text-sm font-medium">
                Welcome to
              </Text>
              <Text className="text-3xl font-bold text-green-900 tracking-tight">
                Brittoo<Text className="text-green-500">.</Text>
              </Text>
            </View>
            <TouchableOpacity className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
              <Text className="text-xl">🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Branding Card */}
          <View className="bg-green-400 rounded-3xl p-6 flex-row items-center justify-between shadow-xl shadow-green-200">
            <View className="flex-1 pr-4">
              <Text className="text-white text-2xl font-bold leading-8">
                Rent anything,{"\n"}anytime.
              </Text>
              <Text className="text-green-100 mt-2 text-sm">
                Save money and reduce waste by renting local.
              </Text>
            </View>
            <View className="bg-white/40 p-2 rounded-2xl">
              <Image
                source={require("../../assets/images/brittoo-logo.png")}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Floating Search Bar */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/browse")}
            activeOpacity={0.9}
            className="bg-white rounded-2xl px-5 py-4 flex-row items-center mt-6 shadow-lg shadow-gray-200 border border-gray-50"
          >
            <Text className="text-green-600 mr-3 text-lg">🔍</Text>
            <Text className="text-gray-400 flex-1 font-medium">
              Search cameras, tools, camping gear...
            </Text>
            <View className="bg-green-50 px-2 py-1 rounded-md">
              <Text className="text-green-700 text-[10px] font-bold">PRO</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Categories Section */}
      <View className="px-6 mb-8">
        <View className="flex-row justify-between items-end mb-4">
          <View>
            <Text className="text-xl font-bold text-gray-900">Categories</Text>
            <Text className="text-gray-500 text-xs">
              What are you looking for?
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}>
            <Text className="text-green-600 font-semibold">View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-2"
        >
          {categories.map((category) => (
            <View key={category.id} className="px-2">
              <CategoryCard
                name={category.name}
                icon={category.icon}
                color={category.color}
                selected={false}
                onPress={() => {
                  filterByCategory(category.name);
                  router.push("/(tabs)/browse");
                }}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Featured Grid */}
      <View className="px-6 mb-8">
        <View className="flex-row justify-between items-end mb-4">
          <View>
            <Text className="text-xl font-bold text-gray-900">
              Trending Now
            </Text>
            <Text className="text-gray-500 text-xs">
              Top picks from the community
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}>
            <Text className="text-green-600 font-semibold">See All</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {featuredProducts.map((product) => (
            <View key={product.id} className="w-[48%] mb-4">
              <ProductCard
                product={product}
                onPress={() => router.push(`/product/${product.id}`)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Trust & Features Section */}
      <View className="bg-gray-50 py-10 px-6">
        <Text className="text-center text-gray-400 font-bold tracking-widest uppercase text-xs mb-8">
          The Brittoo Advantage
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {[
            { icon: "💰", title: "Save Money", desc: "Up to 80% cheaper" },
            { icon: "🛡️", title: "Secure", desc: "Verified users" },
            { icon: "🌱", title: "Eco-Friendly", desc: "Sustainable living" },
            { icon: "⚡", title: "Quick", desc: "Instant booking" },
          ].map((item, index) => (
            <View
              key={index}
              className="w-[48%] bg-white p-5 rounded-3xl mb-4 border border-gray-100 shadow-sm"
            >
              <Text className="text-2xl mb-2">{item.icon}</Text>
              <Text className="font-bold text-gray-900">{item.title}</Text>
              <Text className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">
                {item.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Modern CTA Card */}
      <BuyCreditsScreen />
    </ScrollView>
  );
}
