import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { mockReviews } from "../../constants/mockData";
import { useAuthStore } from "../../store/useAuthStore";
import { useProductStore } from "../../store/useProductStore";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { products, selectedProduct, setSelectedProduct } = useProductStore();
  const { isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setSelectedProduct(product);
    }
    setLoading(false);
  }, [id, products]);

  if (loading || !selectedProduct) {
    return <LoadingSpinner fullScreen />;
  }

  const productReviews = mockReviews.filter(
    (r) => r.productId === selectedProduct.id,
  );

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Image Gallery */}
      <View className="relative">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const page = Math.round(
              e.nativeEvent.contentOffset.x /
                e.nativeEvent.layoutMeasurement.width,
            );
            setSelectedImage(page);
          }}
        >
          {selectedProduct.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              className="w-screen h-96"
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Image Indicators */}
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
          {selectedProduct.images.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                selectedImage === index ? "bg-blue-500" : "bg-white/50"
              }`}
            />
          ))}
        </View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-4 bg-white/90 rounded-full p-2"
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-2xl font-bold">{selectedProduct.title}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-yellow-400 text-lg">★</Text>
              <Text className="text-gray-700 ml-1">
                {selectedProduct.rating.toFixed(1)}
              </Text>
              <Text className="text-gray-500 ml-1">
                ({selectedProduct.reviewsCount} reviews)
              </Text>
            </View>
          </View>
          <View className="bg-blue-600 px-4 py-2 rounded-lg">
            <Text className="text-white text-xl font-bold">
              ${selectedProduct.price}
            </Text>
            <Text className="text-white text-xs">
              per {selectedProduct.priceUnit}
            </Text>
          </View>
        </View>

        <Text className="text-gray-500 mt-2">{selectedProduct.location}</Text>

        <View
          className={`mt-2 px-3 py-1 rounded-full self-start ${
            selectedProduct.available ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Text
            className={`text-sm ${selectedProduct.available ? "text-green-600" : "text-red-600"}`}
          >
            {selectedProduct.available
              ? "Available for rent"
              : "Currently rented"}
          </Text>
        </View>

        {/* Owner Info */}
        <View className="flex-row items-center mt-6 p-4 bg-gray-50 rounded-lg">
          <Image
            source={{ uri: selectedProduct.owner.avatar }}
            className="w-12 h-12 rounded-full"
          />
          <View className="ml-3 flex-1">
            <Text className="font-semibold">{selectedProduct.owner.name}</Text>
            <View className="flex-row items-center">
              <Text className="text-yellow-400">★</Text>
              <Text className="text-gray-600 ml-1">
                {selectedProduct.owner.rating}
              </Text>
            </View>
          </View>
          <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg">
            <Text className="text-white">Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View className="mt-6">
          <Text className="text-lg font-semibold mb-2">Description</Text>
          <Text className="text-gray-700 leading-6">
            {selectedProduct.description}
          </Text>
        </View>

        {/* Specs */}
        {selectedProduct.specs && (
          <View className="mt-6">
            <Text className="text-lg font-semibold mb-2">Specifications</Text>
            <View className="bg-gray-50 rounded-lg p-4">
              {Object.entries(selectedProduct.specs).map(([key, value]) => (
                <View
                  key={key}
                  className="flex-row py-2 border-b border-gray-200 last:border-b-0"
                >
                  <Text className="w-24 text-gray-600 capitalize">{key}:</Text>
                  <Text className="flex-1 text-gray-800">{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reviews */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold">Reviews</Text>
            {isAuthenticated && (
              <TouchableOpacity>
                <Text className="text-green-500">Write a Review</Text>
              </TouchableOpacity>
            )}
          </View>

          {productReviews.map((review) => (
            <View key={review.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <View className="flex-row items-center mb-2">
                <Image
                  source={{ uri: review.userAvatar }}
                  className="w-8 h-8 rounded-full"
                />
                <View className="ml-2 flex-1">
                  <Text className="font-medium">{review.userName}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-yellow-400">★</Text>
                    <Text className="text-gray-600 ml-1">{review.rating}</Text>
                  </View>
                </View>
                <Text className="text-gray-400 text-sm">{review.date}</Text>
              </View>
              <Text className="text-gray-700">{review.comment}</Text>
            </View>
          ))}
        </View>

        {/* Book Button */}
        {selectedProduct.available && (
          <View className="mt-8 mb-4">
            <Button
              title="Book This Item"
              onPress={() =>
                router.push(`/product/booking/${selectedProduct.id}`)
              }
              size="lg"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
