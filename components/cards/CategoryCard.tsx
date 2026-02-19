import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CategoryCardProps {
  name: string;
  icon: string;
  color: string;
  selected?: boolean;
  onPress: () => void;
}

export default function CategoryCard({
  name,
  icon,
  color,
  selected,
  onPress,
}: CategoryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center"
      activeOpacity={0.7}
    >
      <View
        className={`w-16 h-16 rounded-2xl items-center justify-center mb-2 ${
          selected ? "bg-green-500" : "bg-gray-100 border border-gray-200"
        }`}
        style={selected ? {} : { borderColor: "#E5E7EB" }}
      >
        <Text className="text-2xl">{icon}</Text>
        {selected && (
          <View className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full items-center justify-center border border-green-500">
            <Ionicons name="checkmark" size={10} color="#10B981" />
          </View>
        )}
      </View>
      <Text
        className={`text-xs font-medium ${
          selected ? "text-green-600" : "text-gray-600"
        }`}
        numberOfLines={1}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}
