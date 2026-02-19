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
    <View className="bg-white">
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-2">
          <TextInput
            className="flex-1 text-base"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-4 px-4"
      >
        <TouchableOpacity
          onPress={() => onCategorySelect(null)}
          className={`items-center justify-center p-3 rounded-xl mr-3 min-w-[80px] ${
            selectedCategory === null
              ? "border-2 border-blue-500 bg-blue-50"
              : "bg-gray-100"
          }`}
        >
          <Text className="text-3xl mb-1">📦</Text>
          <Text
            className={`text-sm font-medium ${selectedCategory === null ? "text-green-600" : "text-gray-700"}`}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            name={category.name}
            icon={category.icon}
            color={category.color}
            selected={selectedCategory === category.name}
            onPress={() => onCategorySelect(category.name)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
