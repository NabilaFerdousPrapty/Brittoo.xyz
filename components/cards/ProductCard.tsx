import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Product } from "../../types/product.types";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4"
    >
      <Image
        source={{ uri: product.images[0] }}
        className="w-full h-48"
        resizeMode="cover"
      />

      <View className="p-3">
        <Text className="text-lg font-semibold" numberOfLines={1}>
          {product.title}
        </Text>

        <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
          {product.description}
        </Text>

        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-row items-center">
            <Text className="text-green-600 font-bold text-lg">
              ${product.price}
            </Text>
            <Text className="text-gray-500 text-sm">/{product.priceUnit}</Text>
          </View>

          <View className="flex-row items-center">
            <Text className="text-yellow-400 text-lg">★</Text>
            <Text className="text-gray-700 ml-1">
              {product.rating.toFixed(1)}
            </Text>
            <Text className="text-gray-500 text-sm ml-1">
              ({product.reviewsCount})
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-2">
          <Text className="text-gray-500 text-sm">{product.location}</Text>
          <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
          <View
            className={`px-2 py-0.5 rounded-full ${product.available ? "bg-green-100" : "bg-red-100"}`}
          >
            <Text
              className={`text-xs ${product.available ? "text-green-600" : "text-red-600"}`}
            >
              {product.available ? "Available" : "Rented"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
