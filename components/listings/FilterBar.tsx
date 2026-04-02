import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Define categories based on ProductType enum from your mock data
const categories = [
  { id: "GADGET", name: "Gadgets", icon: "📱", color: "#10B981" },
  { id: "ELECTRONICS", name: "Electronics", icon: "💻", color: "#3B82F6" },
  { id: "FURNITURE", name: "Furniture", icon: "🛋️", color: "#F59E0B" },
  { id: "VEHICLE", name: "Vehicles", icon: "🚗", color: "#EF4444" },
  { id: "STATIONARY", name: "Stationary", icon: "✏️", color: "#8B5CF6" },
  {
    id: "MUSICAL_INSTRUMENT",
    name: "Instruments",
    icon: "🎸",
    color: "#EC4899",
  },
  { id: "CLOTHING", name: "Clothing", icon: "👕", color: "#14B89A" },
  { id: "BOOK", name: "Books", icon: "📚", color: "#F97316" },
  { id: "ACADEMIC_BOOK", name: "Academic", icon: "📖", color: "#06B6D4" },
  { id: "APARTMENTS", name: "Apartments", icon: "🏠", color: "#84CC16" },
  { id: "OTHERS", name: "Others", icon: "🎁", color: "#6B7280" },
];

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
}: FilterBarProps) {
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);

  const sortOptions = [
    { id: "recommended", label: "Recommended", icon: "thumbs-up-outline" },
    {
      id: "price_asc",
      label: "Price: Low to High",
      icon: "trending-up-outline",
    },
    {
      id: "price_desc",
      label: "Price: High to Low",
      icon: "trending-down-outline",
    },
    { id: "newest", label: "Newest First", icon: "time-outline" },
    { id: "rating", label: "Top Rated", icon: "star-outline" },
  ];

  const getSortLabel = () => {
    const option = sortOptions.find((o) => o.id === sortBy);
    return option?.label || "Sort by";
  };

  const handleApplyFilters = () => {
    // Here you would apply filters to your products
    setShowFiltersModal(false);
  };

  const handleResetFilters = () => {
    setSortBy("recommended");
    setPriceRange([0, 10000]);
    setShowOnlyAvailable(false);
    setShowOnlyVerified(false);
  };

  return (
    <>
      <View className="bg-white border-b border-gray-100">
        {/* Search Section */}
        <View className="px-5 pt-5 pb-3">
          <Text className="text-sm font-medium text-gray-500 mb-2">
            Find what you need
          </Text>

          {/* Enhanced Search Bar */}
          <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-1 border border-gray-100">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-base ml-3 py-3"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Filters Row */}
          <View className="flex-row mt-3 flex-wrap">
            <TouchableOpacity
              onPress={() => setShowFiltersModal(true)}
              className="flex-row items-center mr-2 mb-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-100"
            >
              <Ionicons name="funnel-outline" size={14} color="#4B5563" />
              <Text className="text-xs text-gray-600 ml-1">Filters</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setSortBy(sortBy === "price_asc" ? "price_desc" : "price_asc")
              }
              className="flex-row items-center mr-2 mb-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-100"
            >
              <Ionicons name="cash-outline" size={14} color="#4B5563" />
              <Text className="text-xs text-gray-600 ml-1">
                {sortBy === "price_asc"
                  ? "Price: Low to High"
                  : sortBy === "price_desc"
                    ? "Price: High to Low"
                    : getSortLabel()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowOnlyAvailable(!showOnlyAvailable)}
              className={`flex-row items-center mr-2 mb-2 rounded-full px-4 py-2 border ${
                showOnlyAvailable
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color={showOnlyAvailable ? "#10B981" : "#4B5563"}
              />
              <Text
                className={`text-xs ml-1 ${showOnlyAvailable ? "text-green-600" : "text-gray-600"}`}
              >
                Available Only
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowOnlyVerified(!showOnlyVerified)}
              className={`flex-row items-center mr-2 mb-2 rounded-full px-4 py-2 border ${
                showOnlyVerified
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color={showOnlyVerified ? "#10B981" : "#4B5563"}
              />
              <Text
                className={`text-xs ml-1 ${showOnlyVerified ? "text-green-600" : "text-gray-600"}`}
              >
                Verified Only
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Section */}
        <View className="px-5 pb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-semibold text-gray-800">
              Browse Categories
            </Text>
            <TouchableOpacity>
              <Text className="text-xs text-green-600">View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {/* All Categories Option */}
            <TouchableOpacity
              onPress={() => onCategorySelect(null)}
              className="items-center mr-4"
            >
              <View
                className={`w-16 h-16 rounded-2xl items-center justify-center mb-2 ${
                  selectedCategory === null
                    ? "bg-green-500"
                    : "bg-gray-100 border border-gray-200"
                }`}
              >
                <Text className="text-2xl">📦</Text>
                {selectedCategory === null && (
                  <View className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full items-center justify-center border border-green-500">
                    <Ionicons name="checkmark" size={10} color="#10B981" />
                  </View>
                )}
              </View>
              <Text
                className={`text-xs font-medium ${
                  selectedCategory === null ? "text-green-600" : "text-gray-600"
                }`}
              >
                All Items
              </Text>
            </TouchableOpacity>

            {/* Category Cards */}
            {categories.map((category) => (
              <View key={category.id} className="mr-4">
                <TouchableOpacity
                  onPress={() => onCategorySelect(category.id)}
                  className="items-center"
                >
                  <View
                    className={`w-16 h-16 rounded-2xl items-center justify-center mb-2 ${
                      selectedCategory === category.id
                        ? "bg-green-500"
                        : "bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <Text className="text-2xl">{category.icon}</Text>
                    {selectedCategory === category.id && (
                      <View className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full items-center justify-center border border-green-500">
                        <Ionicons name="checkmark" size={10} color="#10B981" />
                      </View>
                    )}
                  </View>
                  <Text
                    className={`text-xs font-medium ${
                      selectedCategory === category.id
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
                {selectedCategory === category.id && (
                  <View className="absolute -bottom-2 left-1/2 -ml-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <TouchableWithoutFeedback onPress={() => setShowFiltersModal(false)}>
            <View className="flex-1" />
          </TouchableWithoutFeedback>

          <View className="bg-white rounded-t-3xl">
            <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
              <Text className="text-xl font-semibold text-gray-900">
                Filters
              </Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="max-h-[70vh]"
              showsVerticalScrollIndicator={false}
            >
              {/* Sort By Section */}
              <View className="p-5 border-b border-gray-100">
                <Text className="text-base font-semibold text-gray-800 mb-3">
                  Sort By
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => setSortBy(option.id)}
                      className={`flex-row items-center px-4 py-2 rounded-full ${
                        sortBy === option.id ? "bg-green-500" : "bg-gray-100"
                      }`}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={16}
                        color={sortBy === option.id ? "white" : "#4B5563"}
                      />
                      <Text
                        className={`ml-2 text-sm ${
                          sortBy === option.id ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range Section */}
              <View className="p-5 border-b border-gray-100">
                <Text className="text-base font-semibold text-gray-800 mb-3">
                  Price Range
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 bg-gray-100 rounded-xl px-3 py-2 mr-2">
                    <Text className="text-xs text-gray-500 mb-1">Min</Text>
                    <Text className="text-lg font-semibold text-gray-800">
                      ৳{priceRange[0]}
                    </Text>
                  </View>
                  <Text className="text-gray-400">to</Text>
                  <View className="flex-1 bg-gray-100 rounded-xl px-3 py-2 ml-2">
                    <Text className="text-xs text-gray-500 mb-1">Max</Text>
                    <Text className="text-lg font-semibold text-gray-800">
                      ৳{priceRange[1]}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Additional Filters */}
              <View className="p-5 border-b border-gray-100">
                <Text className="text-base font-semibold text-gray-800 mb-3">
                  Additional Filters
                </Text>

                <TouchableOpacity
                  onPress={() => setShowOnlyAvailable(!showOnlyAvailable)}
                  className="flex-row items-center justify-between py-3"
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#4B5563"
                    />
                    <Text className="text-gray-700 ml-3">
                      Show only available items
                    </Text>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full border-2 ${
                      showOnlyAvailable
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {showOnlyAvailable && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowOnlyVerified(!showOnlyVerified)}
                  className="flex-row items-center justify-between py-3"
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color="#4B5563"
                    />
                    <Text className="text-gray-700 ml-3">
                      Show only verified items
                    </Text>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full border-2 ${
                      showOnlyVerified
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {showOnlyVerified && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row p-5 gap-3 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleResetFilters}
                className="flex-1 py-3 rounded-xl border border-gray-300"
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Reset All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyFilters}
                className="flex-1 py-3 rounded-xl bg-green-500"
              >
                <Text className="text-white font-semibold text-center">
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
