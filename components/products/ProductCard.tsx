import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { BACKEND_URL, Product } from "../../hooks/api";

const BASE = BACKEND_URL;

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

const CONDITION_COLORS: Record<string, string> = {
  NEW: "#16a34a",
  LIKE_NEW: "#2563eb",
  GOOD: "#7c3aed",
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

interface Props {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<Props> = ({ product, compact = false }) => {
  const imageUrl = product.optimizedImages?.[0]
    ? `${BASE}${product.optimizedImages[0]}`
    : product.productImages?.[0]
      ? `${BASE}${product.productImages[0]}`
      : null;

  const conditionColor =
    CONDITION_COLORS[product.productCondition] ?? "#6b7280";
  const conditionLabel =
    CONDITION_LABELS[product.productCondition] ?? product.productCondition;
  const typeIcon = TYPE_ICONS[product.productType] ?? "grid-outline";

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(products)/[id]",
          params: { id: product.id },
        })
      }
      activeOpacity={0.85}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-3"
      style={{
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      }}
    >
      {/* Image */}
      <View className="relative">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full"
            style={{ height: compact ? 140 : 180 }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-full bg-gray-50 items-center justify-center"
            style={{ height: compact ? 140 : 180 }}
          >
            <Ionicons name={typeIcon} size={36} color="#d1d5db" />
          </View>
        )}

        {/* Badges overlay */}
        <View className="absolute top-2 left-2 flex-row gap-1.5">
          {!product.isAvailable && (
            <View className="bg-gray-800/80 rounded-lg px-2 py-0.5">
              <Text className="text-white text-xs font-medium">
                Unavailable
              </Text>
            </View>
          )}
          {product.isOnHold && (
            <View className="bg-amber-500/90 rounded-lg px-2 py-0.5">
              <Text className="text-white text-xs font-medium">On Hold</Text>
            </View>
          )}
          {product.isForSale && (
            <View className="bg-blue-600/90 rounded-lg px-2 py-0.5">
              <Text className="text-white text-xs font-medium">For Sale</Text>
            </View>
          )}
        </View>

        {/* Product SL */}
        <View className="absolute top-2 right-2 bg-white/90 rounded-lg px-2 py-0.5">
          <Text className="text-gray-500 text-xs font-mono">
            {product.productSL}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Name row */}
        <View className="flex-row items-start justify-between gap-2 mb-1.5">
          <Text
            className="text-gray-900 font-semibold text-sm flex-1 leading-5"
            numberOfLines={1}
          >
            {product.name}
          </Text>
          <View
            className="rounded-md px-1.5 py-0.5"
            style={{ backgroundColor: conditionColor + "18" }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: conditionColor }}
            >
              {conditionLabel}
            </Text>
          </View>
        </View>

        {/* Owner */}
        <View className="flex-row items-center gap-1 mb-2">
          <Ionicons name="person-circle-outline" size={12} color="#9ca3af" />
          <Text className="text-gray-400 text-xs" numberOfLines={1}>
            {product.owner.name}
            {product.owner.brittooVerified ? "  ✓" : ""}
          </Text>
        </View>

        {/* Pricing row */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 font-bold text-base">
              ৳{product.pricePerDay}
              <Text className="text-gray-400 font-normal text-xs"> /day</Text>
            </Text>
            {product.pricePerHour != null && (
              <Text className="text-gray-400 text-xs">
                ৳{product.pricePerHour}/hr
              </Text>
            )}
          </View>

          <View className="flex-row items-center gap-1.5">
            <Ionicons name={typeIcon} size={13} color="#9ca3af" />
            <Text className="text-gray-400 text-xs">
              {product.productType.replace(/_/g, " ")}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
