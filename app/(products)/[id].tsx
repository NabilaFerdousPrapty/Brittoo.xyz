import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/button";
import { STORAGE_KEYS } from "../../constants";
import {
  BACKEND_URL,
  deleteProduct,
  getProducts,
  Product,
  updateProductUser,
} from "../../hooks/api";

const BASE = BACKEND_URL;
const { width } = Dimensions.get("window");

const CONDITION_COLORS: Record<string, string> = {
  NEW: "#10b981",
  LIKE_NEW: "#059669",
  GOOD: "#047857",
  FAIR: "#d97706",
  POOR: "#dc2626",
};
const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};
const TYPE_ICONS: Record<string, any> = {
  GADGET: "hardware-chip-outline",
  FURNITURE: "bed-outline",
  VEHICLE: "car-outline",
  STATIONARY: "pencil-outline",
  MUSICAL_INSTRUMENT: "musical-notes-outline",
  CLOTHING: "shirt-outline",
  BOOK: "book-outline",
  ACADEMIC_BOOK: "school-outline",
  ELECTRONICS: "flash-outline",
  APARTMENTS: "home-outline",
  OTHERS: "grid-outline",
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadProduct();
    loadCurrentUser();
  }, [id]);

  const loadCurrentUser = async () => {
    const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    if (userStr) setCurrentUserId(JSON.parse(userStr).id);
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ productId: id });
      if (res.data.products?.length > 0) setProduct(res.data.products[0]);
    } catch (err) {
      console.error("Failed to load product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Product", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(product!.id);
            Alert.alert("Deleted", "Product removed successfully");
            router.back();
          } catch (err: any) {
            Alert.alert(
              "Error",
              err?.response?.data?.message || "Delete failed",
            );
          }
        },
      },
    ]);
  };

  const handleToggleAvailability = async () => {
    if (!product) return;
    setToggling(true);
    try {
      const res = await updateProductUser(product.id, {
        isAvailable: !product.isAvailable,
      });
      setProduct(res.data.product);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Update failed");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400 text-sm">Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={40} color="#e5e7eb" />
        <Text className="text-gray-400 text-sm mt-3">Product not found</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-emerald-600 font-medium">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images =
    product.optimizedImages?.length > 0
      ? product.optimizedImages
      : product.productImages;
  const isOwner = currentUserId === product.ownerId;
  const conditionColor =
    CONDITION_COLORS[product.productCondition] ?? "#6b7280";
  const conditionLabel =
    CONDITION_LABELS[product.productCondition] ?? product.productCondition;
  const typeIcon = TYPE_ICONS[product.productType] ?? "grid-outline";

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        <View className="relative">
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            onMomentumScrollEnd={(e) => {
              setCurrentImage(
                Math.round(e.nativeEvent.contentOffset.x / width),
              );
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: `${BASE}${item}` }}
                style={{ width, height: 280 }}
                resizeMode="cover"
              />
            )}
            ListEmptyComponent={
              <View
                className="bg-gray-50 items-center justify-center"
                style={{ width, height: 280 }}
              >
                <Ionicons name={typeIcon} size={48} color="#d1d5db" />
              </View>
            }
          />

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-4 w-9 h-9 bg-white/90 rounded-full items-center justify-center"
            style={{ elevation: 2 }}
          >
            <Ionicons name="arrow-back" size={18} color="#111827" />
          </TouchableOpacity>

          {/* Image indicator */}
          {images.length > 1 && (
            <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
              {images.map((_, i) => (
                <View
                  key={i}
                  className="h-1.5 rounded-full"
                  style={{
                    width: i === currentImage ? 16 : 6,
                    backgroundColor:
                      i === currentImage ? "#10b981" : "rgba(0,0,0,0.3)",
                  }}
                />
              ))}
            </View>
          )}

          {/* Status badges */}
          <View className="absolute bottom-3 right-3 gap-1">
            {!product.isAvailable && (
              <View className="bg-gray-800/80 rounded-lg px-2 py-0.5 self-end">
                <Text className="text-white text-xs font-medium">
                  Unavailable
                </Text>
              </View>
            )}
            {product.isOnHold && (
              <View className="bg-amber-500/90 rounded-lg px-2 py-0.5 self-end">
                <Text className="text-white text-xs font-medium">On Hold</Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-5 pt-4 pb-10">
          {/* Header row */}
          <View className="flex-row items-start justify-between mb-1">
            <Text className="text-gray-900 text-xl font-semibold flex-1 leading-6 pr-3">
              {product.name}
            </Text>
            <View
              className="rounded-lg px-2 py-1"
              style={{ backgroundColor: conditionColor + "18" }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: conditionColor }}
              >
                {conditionLabel}
              </Text>
            </View>
          </View>

          {/* SL & type */}
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-gray-400 text-xs font-mono">
              {product.productSL}
            </Text>
            <Text className="text-gray-300 text-xs">•</Text>
            <Ionicons name={typeIcon} size={12} color="#9ca3af" />
            <Text className="text-gray-400 text-xs">
              {product.productType.replace(/_/g, " ")}
            </Text>
            <Text className="text-gray-300 text-xs">•</Text>
            <Text className="text-gray-400 text-xs">
              {product.productAge}yr old
            </Text>
          </View>

          {/* Pricing card */}
          <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4">
            <Text className="text-emerald-700 text-xs mb-2 uppercase tracking-wider font-medium">
              Pricing
            </Text>
            <View className="flex-row items-end gap-4">
              <View>
                <Text className="text-emerald-800 text-2xl font-bold">
                  ৳{product.pricePerDay}
                </Text>
                <Text className="text-emerald-600 text-xs">per day</Text>
              </View>
              {product.pricePerHour != null && (
                <>
                  <View className="w-px h-8 bg-emerald-200" />
                  <View>
                    <Text className="text-emerald-700 text-lg font-semibold">
                      ৳{product.pricePerHour}
                    </Text>
                    <Text className="text-emerald-600 text-xs">per hour</Text>
                  </View>
                </>
              )}
              {product.isForSale && product.askingPrice && (
                <>
                  <View className="w-px h-8 bg-emerald-200" />
                  <View>
                    <Text className="text-emerald-800 text-lg font-semibold">
                      ৳{product.askingPrice}
                    </Text>
                    <Text className="text-emerald-600 text-xs">sale price</Text>
                  </View>
                </>
              )}
            </View>
            {product.isForSale && product.minPrice && (
              <Text className="text-emerald-600 text-xs mt-2">
                Min. offer: ৳{product.minPrice}
              </Text>
            )}
          </View>

          {/* Owner card */}
          <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
            <Text className="text-gray-400 text-xs mb-2 uppercase tracking-wider font-medium">
              Owner
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 bg-emerald-600 rounded-xl items-center justify-center">
                  <Text className="text-white text-sm font-semibold">
                    {product.owner.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-gray-900 font-medium text-sm">
                      {product.owner.name}
                    </Text>
                    {product.owner.brittooVerified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color="#10b981"
                      />
                    )}
                  </View>
                  <Text className="text-gray-400 text-xs">
                    {product.owner._count.rentedOutProducts} rented out
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-gray-400 text-xs">Security</Text>
                <Text className="text-gray-900 text-xs font-semibold">
                  {product.owner.securityScore}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {product.productDescription && (
            <View className="mb-4">
              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-2">
                Description
              </Text>
              <Text className="text-gray-700 text-sm leading-6">
                {product.productDescription}
              </Text>
            </View>
          )}

          {/* Tags */}
          {product.tags && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {product.tags.split(",").map((tag, i) => (
                <View key={i} className="bg-emerald-50 rounded-full px-3 py-1">
                  <Text className="text-emerald-700 text-xs">{tag.trim()}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Details grid */}
          <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
            <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
              Details
            </Text>
            {[
              { label: "OMV", value: `৳${product.omv}` },
              { label: "2nd Hand Price", value: `৳${product.secondHandPrice}` },
              {
                label: "For Rent",
                value: !product.isForSaleOnly ? "Yes" : "No",
              },
              { label: "For Sale", value: product.isForSale ? "Yes" : "No" },
              {
                label: "AI Enabled",
                value: product.isAiEnabled ? "Yes" : "No",
              },
            ].map((item, i, arr) => (
              <View
                key={item.label}
                className={`flex-row justify-between py-2 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <Text className="text-gray-400 text-sm">{item.label}</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Owner actions */}
          {isOwner && (
            <View className="gap-3">
              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium">
                Your Actions
              </Text>
              <View className="flex-row gap-3">
                <Button
                  label={
                    product.isAvailable ? "Mark Unavailable" : "Mark Available"
                  }
                  onPress={handleToggleAvailability}
                  loading={toggling}
                  variant={product.isAvailable ? "secondary" : "primary"}
                  size="md"
                  className="flex-1"
                />
                <Button
                  label="Edit"
                  onPress={() =>
                    router.push({
                      pathname: "/(products)/edit",
                      params: { id: product.id },
                    })
                  }
                  variant="secondary"
                  size="md"
                  className="flex-1"
                />
              </View>
              <Button
                label="Delete Product"
                onPress={handleDelete}
                variant="danger"
                size="md"
              />
            </View>
          )}

          {/* Non-owner CTA */}
          {!isOwner && (
            <View className="gap-3">
              {!product.isForSaleOnly && (
                <Button
                  label="Request to Rent"
                  onPress={() =>
                    router.push({
                      pathname: "/(products)/rental-request",
                      params: { productId: product.id },
                    })
                  }
                  size="lg"
                />
              )}
              {product.isForSale && (
                <Button
                  label="Make an Offer"
                  onPress={() =>
                    router.push({
                      pathname: "/(products)/purchase-request",
                      params: { productId: product.id },
                    })
                  }
                  variant="secondary"
                  size="lg"
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}