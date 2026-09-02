// app/(products)/my-listings.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BACKEND_URL, getProducts, Product } from "../../hooks/api";

const CONDITION_COLORS: Record<string, string> = {
  NEW: "#10b981",
  LIKE_NEW: "#059669",
  GOOD: "#047857",
  FAIR: "#d97706",
  POOR: "#dc2626",
};

export default function MyListingsScreen() {
  const { ownerId } = useLocalSearchParams<{ ownerId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async () => {
    try {
      const res = await getProducts({ ownerId });
      setProducts(res.data.products ?? []);
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (ownerId) fetchListings();
  }, [ownerId]);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400 text-sm">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-5 pt-14 pb-4 bg-white border-b border-gray-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-lg font-semibold">
          My Listings
        </Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchListings();
            }}
            tintColor="#10b981"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="cube-outline" size={40} color="#e5e7eb" />
            <Text className="text-gray-400 text-sm mt-3">
              You haven't listed anything yet
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const image =
            item.optimizedImages?.[0] ?? item.productImages?.[0];
          const conditionColor =
            CONDITION_COLORS[item.productCondition] ?? "#6b7280";

          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(products)/[id]",
                  params: { id: item.id },
                })
              }
              className="bg-white border border-gray-100 rounded-2xl p-3 mb-3 flex-row gap-3"
              style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              {image ? (
                <Image
                  source={{ uri: `${BACKEND_URL}${image}` }}
                  className="w-16 h-16 rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center">
                  <Ionicons name="cube-outline" size={22} color="#d1d5db" />
                </View>
              )}

              <View className="flex-1 justify-center">
                <Text
                  className="text-gray-900 font-medium text-sm"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  ৳{item.pricePerDay}/day
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <View
                    className="rounded-full px-2 py-0.5"
                    style={{ backgroundColor: conditionColor + "18" }}
                  >
                    <Text
                      className="text-[10px] font-medium"
                      style={{ color: conditionColor }}
                    >
                      {item.productCondition.replace("_", " ")}
                    </Text>
                  </View>
                  {!item.isAvailable && (
                    <Text className="text-[10px] text-gray-400">
                      Unavailable
                    </Text>
                  )}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}