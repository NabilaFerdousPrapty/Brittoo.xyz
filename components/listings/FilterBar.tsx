import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { categories } from "../../constants/categories";
import CategoryCard from "../cards/CategoryCard";

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
  return (
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
        <View className="flex-row mt-3">
          <TouchableOpacity className="flex-row items-center mr-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-100">
            <Ionicons name="funnel-outline" size={14} color="#4B5563" />
            <Text className="text-xs text-gray-600 ml-1">Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center mr-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-100">
            <Ionicons name="time-outline" size={14} color="#4B5563" />
            <Text className="text-xs text-gray-600 ml-1">
              Price: Low to High
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-100">
            <Ionicons name="location-outline" size={14} color="#4B5563" />
            <Text className="text-xs text-gray-600 ml-1">Near me</Text>
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
              <CategoryCard
                name={category.name}
                icon={category.icon}
                color={category.color}
                selected={selectedCategory === category.name}
                onPress={() => onCategorySelect(category.name)}
              />
              {selectedCategory === category.name && (
                <View className="absolute -bottom-2 left-1/2 -ml-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
