import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FilterBar } from "../../components/products/FilterBar";
import { ProductCard } from "../../components/products/ProductCard";
import { SearchBar } from "../../components/products/SearchBar";
import { useProducts } from "../../hooks/useProducts";

export default function ProductsScreen() {
  const {
    products,
    loading,
    refreshing,
    hasMore,
    total,
    fetchProducts,
    refresh,
  } = useProducts();
  const [search, setSearch] = useState("");
  const [productType, setProductType] = useState("");
  const [isAiMode, setIsAiMode] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Initial load
  useEffect(() => {
    fetchProducts({}, true);
  }, []);

  const buildParams = useCallback(
    () => ({
      ...(isAiMode ? { prompt: search } : { search }),
      ...(productType ? { productType } : {}),
    }),
    [search, productType, isAiMode],
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts(buildParams(), true);
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [search, productType]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchProducts(buildParams());
    }
  };

  const handleRefresh = () => refresh(buildParams());

  const handleTypeChange = (val: string) => {
    setProductType(val);
  };

  const handleAiToggle = () => {
    setIsAiMode((p) => !p);
    setSearch("");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 pb-2 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between px-4 mb-3">
          <View>
            <Text className="text-gray-900 text-xl font-semibold">Browse</Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              {total > 0 ? `${total} products available` : "Find what you need"}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => router.push("/(products)/requests")}
              className="flex-row items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2"
              activeOpacity={0.8}
            >
              <Ionicons name="receipt-outline" size={16} color="#10b981" />
              <Text className="text-emerald-700 text-xs font-semibold">
                Requests
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(products)/create")}
              className="flex-row items-center gap-1.5 bg-emerald-600 rounded-xl px-3 py-2"
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text className="text-white text-xs font-semibold">List Item</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => fetchProducts(buildParams(), true)}
          isAiMode={isAiMode}
          onToggleAi={handleAiToggle}
        />

        {isAiMode && (
          <View className="mx-4 mb-1 flex-row items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <Ionicons name="sparkles" size={13} color="#10b981" />
            <Text className="text-emerald-700 text-xs flex-1">
              AI mode — describe what you need in natural language
            </Text>
          </View>
        )}

        {!isAiMode && (
          <FilterBar selected={productType} onSelect={handleTypeChange} />
        )}
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <ProductCard product={item} />
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center justify-center py-20">
              <Ionicons name="cube-outline" size={40} color="#d1d5db" />
              <Text className="text-gray-300 text-sm mt-3">
                No products found
              </Text>
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  className="mt-3"
                >
                  <Text className="text-emerald-600 text-sm font-medium">
                    Clear search
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && products.length > 0 ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="#10b981" />
            </View>
          ) : null
        }
      />

      {/* Loading overlay for first load */}
      {loading && products.length === 0 && (
        <View className="absolute inset-0 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="text-gray-400 text-sm mt-3">
            {isAiMode ? "AI is finding products..." : "Loading products..."}
          </Text>
        </View>
      )}
    </View>
  );
}