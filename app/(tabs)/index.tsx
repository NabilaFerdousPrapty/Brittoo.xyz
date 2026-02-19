import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
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
      {/* Header */}
      <View className="bg-green-600 px-4 pt-12 pb-6">
        <Text className="text-3xl font-bold text-white mb-2">Brittoo</Text>
        <Text className="text-green-100">
          Rent what you need, when you need it
        </Text>
      </View>

      {/* Categories */}
      <View className="bg-white mt-4 p-4">
        <Text className="text-lg font-semibold mb-4">Popular Categories</Text>
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
          <Text className="text-lg font-semibold">Featured Items</Text>
          <Text
            className="text-green-600"
            onPress={() => router.push("/(tabs)/browse")}
          >
            See All
          </Text>
        </View>

        {featuredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => router.push(`/product/${product.id}`)}
          />
        ))}
      </View>

      {/* How It Works */}
      <View className="bg-white mt-4 p-4 mb-4">
        <Text className="text-lg font-semibold mb-4">How It Works</Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-3xl mb-2">🔍</Text>
            <Text className="text-sm font-medium">Find</Text>
            <Text className="text-xs text-gray-500 text-center">
              Search for items
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl mb-2">📅</Text>
            <Text className="text-sm font-medium">Book</Text>
            <Text className="text-xs text-gray-500 text-center">
              Choose dates
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl mb-2">🔑</Text>
            <Text className="text-sm font-medium">Pickup</Text>
            <Text className="text-xs text-gray-500 text-center">
              Get your item
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
