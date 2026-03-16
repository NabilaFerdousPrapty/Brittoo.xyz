import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { mockReviews } from "../../constants/mockData";
import { useAuthStore } from "../../store/useAuthStore";
import { useProductStore } from "../../store/useProductStore";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { products, selectedProduct, setSelectedProduct } = useProductStore();
  const { isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

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

  const averageRating = selectedProduct.rating;
  const reviewCount = selectedProduct.reviewsCount;

  return (
    <>
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
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
            className="bg-gray-50"
          >
            {selectedProduct.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => setShowFullImage(true)}
              >
                <Image
                  source={{ uri: image }}
                  style={{ width, height: 400 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)"]}
            className="absolute bottom-0 left-0 right-0 h-20"
          />

          {/* Image Indicators */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
            {selectedProduct.images.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  selectedImage === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </View>

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-4 bg-white/90 rounded-full p-2"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            className="absolute top-12 right-4 bg-white/90 rounded-full p-2"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#EF4444" : "#374151"}
            />
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            onPress={() => {}}
            className="absolute top-12 right-16 bg-white/90 rounded-full p-2"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="share-outline" size={22} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Product Info Section */}
        <View className="px-5 py-6">
          {/* Title and Price */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-4">
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                {selectedProduct.title}
              </Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text className="text-green-700 font-semibold ml-1">
                    {averageRating.toFixed(1)}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm ml-2">
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </Text>
              </View>
            </View>
            <View className="bg-green-500 px-4 py-3 rounded-2xl">
              <Text className="text-white text-2xl font-bold">
                ৳{selectedProduct.price}
              </Text>
              <Text className="text-green-100 text-xs text-right">
                per {selectedProduct.priceUnit}
              </Text>
            </View>
          </View>

          {/* Location and Availability */}
          <View className="flex-row items-center mt-4">
            <View className="flex-row items-center flex-1">
              <Ionicons name="location-outline" size={18} color="#10B981" />
              <Text className="text-gray-600 ml-1">
                {selectedProduct.location}
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${
                selectedProduct.available ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${
                    selectedProduct.available ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <Text
                  className={`text-sm font-medium ${
                    selectedProduct.available
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {selectedProduct.available
                    ? "Available Now"
                    : "Currently Rented"}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View className="flex-row mt-6 bg-gray-50 rounded-2xl p-4">
            <View className="flex-1 items-center">
              <Ionicons name="calendar-outline" size={24} color="#10B981" />
              <Text className="text-xs text-gray-500 mt-1">Min. Rental</Text>
              <Text className="font-semibold text-gray-900">3 days</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#10B981"
              />
              <Text className="text-xs text-gray-500 mt-1">Protection</Text>
              <Text className="font-semibold text-gray-900">Covered</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Ionicons name="time-outline" size={24} color="#10B981" />
              <Text className="text-xs text-gray-500 mt-1">Free Pickup</Text>
              <Text className="font-semibold text-gray-900">Today</Text>
            </View>
          </View>

          {/* Owner Info */}
          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Hosted by
            </Text>
            <View className="flex-row items-center bg-green-50 rounded-2xl p-4">
              <Image
                source={{ uri: selectedProduct.owner.avatar }}
                className="w-16 h-16 rounded-full border-2 border-white"
              />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-gray-900">
                  {selectedProduct.owner.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="flex-row items-center bg-white px-2 py-1 rounded-full">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-green-600 font-medium ml-1">
                      {selectedProduct.owner.rating}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-sm ml-2">
                    24 items listed
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="bg-white p-3 rounded-full border border-green-200">
                <Ionicons name="chatbubble-outline" size={22} color="#10B981" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </Text>
            <Text className="text-gray-600 leading-6">
              {selectedProduct.description}
            </Text>
          </View>

          {/* Specifications */}
          {selectedProduct.specs && (
            <View className="mt-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Specifications
              </Text>
              <View className="bg-gray-50 rounded-2xl overflow-hidden">
                {Object.entries(selectedProduct.specs).map(
                  ([key, value], index) => (
                    <View
                      key={key}
                      className={`flex-row py-3 px-4 ${
                        index !==
                        Object.entries(selectedProduct.specs!).length - 1
                          ? "border-b border-gray-200"
                          : ""
                      }`}
                    >
                      <Text className="w-24 text-gray-500 capitalize">
                        {key}:
                      </Text>
                      <Text className="flex-1 text-gray-900 font-medium">
                        {value}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>
          )}

          {/* Reviews Section */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-lg font-semibold text-gray-900">
                  Reviews
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="flex-row items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={16}
                        color={star <= averageRating ? "#F59E0B" : "#E5E7EB"}
                      />
                    ))}
                  </View>
                  <Text className="text-gray-600 ml-2">
                    {averageRating.toFixed(1)}
                  </Text>
                </View>
              </View>
              {isAuthenticated && (
                <TouchableOpacity className="flex-row items-center bg-green-500 px-4 py-2 rounded-full">
                  <Ionicons name="create-outline" size={18} color="white" />
                  <Text className="text-white font-medium ml-1">
                    Write Review
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {productReviews.length > 0 ? (
              <>
                {productReviews.slice(0, 3).map((review) => (
                  <View
                    key={review.id}
                    className="mb-4 bg-gray-50 rounded-2xl p-4"
                  >
                    <View className="flex-row items-center mb-3">
                      <Image
                        source={{ uri: review.userAvatar }}
                        className="w-10 h-10 rounded-full"
                      />
                      <View className="ml-3 flex-1">
                        <Text className="font-semibold text-gray-900">
                          {review.userName}
                        </Text>
                        <View className="flex-row items-center">
                          <View className="flex-row items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Ionicons
                                key={star}
                                name="star"
                                size={12}
                                color={
                                  star <= review.rating ? "#F59E0B" : "#E5E7EB"
                                }
                              />
                            ))}
                          </View>
                        </View>
                      </View>
                      <Text className="text-gray-400 text-xs">
                        {review.date}
                      </Text>
                    </View>
                    <Text className="text-gray-600 leading-5">
                      {review.comment}
                    </Text>
                  </View>
                ))}

                {productReviews.length > 3 && (
                  <TouchableOpacity className="mt-2">
                    <Text className="text-green-600 font-semibold text-center">
                      View all {productReviews.length} reviews
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View className="bg-gray-50 rounded-2xl p-8 items-center">
                <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-400 mt-3">No reviews yet</Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Be the first to review this item
                </Text>
              </View>
            )}
          </View>

          {/* Similar Items Section */}
          <View className="mt-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              You might also like
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-2"
            >
              {[1, 2, 3].map((item) => (
                <TouchableOpacity
                  key={item}
                  className="w-48 mx-2 bg-gray-50 rounded-2xl overflow-hidden"
                >
                  <Image
                    source={{ uri: "https://via.placeholder.com/200" }}
                    className="w-full h-32"
                  />
                  <View className="p-3">
                    <Text className="font-semibold text-gray-900">
                      Similar Item
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text className="text-green-600 ml-1">4.8</Text>
                    </View>
                    <Text className="text-green-600 font-bold mt-2">
                      $25/day
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View className="bg-white border-t border-gray-100 px-5 py-3">
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-xs text-gray-500">Total (3 days)</Text>
            <Text className="text-xl font-bold text-gray-900">
              ${selectedProduct.price * 3}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              selectedProduct.available &&
              router.push(`/product/booking/${selectedProduct.id}`)
            }
            className={`flex-1 py-3 rounded-xl ${
              selectedProduct.available ? "bg-green-500" : "bg-gray-300"
            }`}
            disabled={!selectedProduct.available}
          >
            <LinearGradient
              colors={
                selectedProduct.available
                  ? ["#22c55e", "#15803d"]
                  : ["#9CA3AF", "#6B7280"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute inset-0 rounded-xl"
            />
            <Text className="text-white font-semibold text-center">
              {selectedProduct.available ? "Book Now" : "Not Available"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Screen Image Modal */}
      <Modal visible={showFullImage} transparent={true} animationType="fade">
        <View className="flex-1 bg-black">
          <TouchableOpacity
            onPress={() => setShowFullImage(false)}
            className="absolute top-12 right-4 z-10 bg-white/20 rounded-full p-2"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="flex-1"
          >
            {selectedProduct.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width, height: Dimensions.get("window").height }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
