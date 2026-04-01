// components/ProductCard.tsx
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Product } from "../../types/brittoo.types";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  // Get the first image from productImages array
  const productImage =
    product.productImages?.[0] ||
    "https://via.placeholder.com/400x300?text=No+Image";

  // Get display price based on product type
  const getDisplayPrice = () => {
    if (product.isForSaleOnly && product.askingPrice) {
      return `৳${product.askingPrice}`;
    }
    if (product.pricePerDay) {
      return `৳${product.pricePerDay}`;
    }
    if (product.pricePerHour) {
      return `৳${product.pricePerHour}`;
    }
    return "Price on request";
  };

  // Get price unit
  const getPriceUnit = () => {
    if (product.isForSaleOnly && product.askingPrice) {
      return "";
    }
    if (product.pricePerDay) {
      return "/day";
    }
    if (product.pricePerHour) {
      return "/hour";
    }
    return "";
  };

  // Get product status
  const getProductStatus = () => {
    if (!product.isAvailable) return { text: "Not Available", color: "red" };
    if (product.isRented) return { text: "Rented", color: "orange" };
    if (product.isOnHold) return { text: "On Hold", color: "yellow" };
    return { text: "Available", color: "green" };
  };

  // Get condition display
  const getConditionDisplay = () => {
    switch (product.productCondition) {
      case "NEW":
        return { text: "New", color: "green" };
      case "LIKE_NEW":
        return { text: "Like New", color: "blue" };
      case "GOOD":
        return { text: "Good", color: "yellow" };
      case "FAIR":
        return { text: "Fair", color: "orange" };
      case "POOR":
        return { text: "Poor", color: "red" };
      default:
        return { text: product.productCondition, color: "gray" };
    }
  };

  // Get type display
  const getTypeDisplay = () => {
    return product.productType.replace(/_/g, " ");
  };

  const status = getProductStatus();
  const condition = getConditionDisplay();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4"
      activeOpacity={0.8}
    >
      {/* Product Image */}
      <Image
        source={{ uri: productImage }}
        className="w-full h-48"
        resizeMode="cover"
      />

      {/* Verified Badge */}
      {product.isBrittooVerified && (
        <View className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded-md">
          <Text className="text-white text-xs font-semibold">✓ Verified</Text>
        </View>
      )}

      {/* Product Info */}
      <View className="p-3">
        {/* Title */}
        <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
          {product.name}
        </Text>

        {/* Description */}
        <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
          {product.productDescription}
        </Text>

        {/* Price and Rating */}
        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-row items-baseline">
            <Text className="text-green-600 font-bold text-lg">
              {getDisplayPrice()}
            </Text>
            {getPriceUnit() && (
              <Text className="text-gray-500 text-sm ml-1">
                {getPriceUnit()}
              </Text>
            )}
          </View>

          <View className="flex-row items-center">
            <Text className="text-yellow-400 text-lg">★</Text>
          </View>
        </View>

        {/* Location and Status Row */}
        <View className="flex-row items-center mt-2">
          <Text className="text-gray-500 text-sm" numberOfLines={1}>
            📍 {product.owner?.name || "Unknown Owner"}
          </Text>
          <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
          <View
            className={`px-2 py-0.5 rounded-full ${
              status.color === "green"
                ? "bg-green-100"
                : status.color === "red"
                  ? "bg-red-100"
                  : status.color === "orange"
                    ? "bg-orange-100"
                    : "bg-yellow-100"
            }`}
          >
            <Text
              className={`text-xs ${
                status.color === "green"
                  ? "text-green-600"
                  : status.color === "red"
                    ? "text-red-600"
                    : status.color === "orange"
                      ? "text-orange-600"
                      : "text-yellow-600"
              }`}
            >
              {status.text}
            </Text>
          </View>
        </View>

        {/* Condition and Type Row */}
        <View className="flex-row items-center mt-2 gap-2">
          <View
            className={`px-2 py-0.5 rounded-full ${
              condition.color === "green"
                ? "bg-green-100"
                : condition.color === "blue"
                  ? "bg-blue-100"
                  : condition.color === "yellow"
                    ? "bg-yellow-100"
                    : condition.color === "orange"
                      ? "bg-orange-100"
                      : condition.color === "red"
                        ? "bg-red-100"
                        : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-xs ${
                condition.color === "green"
                  ? "text-green-600"
                  : condition.color === "blue"
                    ? "text-blue-600"
                    : condition.color === "yellow"
                      ? "text-yellow-600"
                      : condition.color === "orange"
                        ? "text-orange-600"
                        : condition.color === "red"
                          ? "text-red-600"
                          : "text-gray-600"
              }`}
            >
              {condition.text}
            </Text>
          </View>
          <View className="bg-gray-100 px-2 py-0.5 rounded-full">
            <Text className="text-xs text-gray-600">{getTypeDisplay()}</Text>
          </View>
          {product.isForSaleOnly && (
            <View className="bg-purple-100 px-2 py-0.5 rounded-full">
              <Text className="text-xs text-purple-600">For Sale</Text>
            </View>
          )}
          {product.isForSale && !product.isForSaleOnly && (
            <View className="bg-blue-100 px-2 py-0.5 rounded-full">
              <Text className="text-xs text-blue-600">For Rent & Sale</Text>
            </View>
          )}
        </View>

        {/* Additional Info */}
        {product.quantity > 1 && (
          <Text className="text-xs text-gray-500 mt-2">
            📦 {product.quantity} units available
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
