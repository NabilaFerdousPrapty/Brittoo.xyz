import React from "react";
import { Text, TouchableOpacity } from "react-native";

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
      className={`items-center justify-center p-3 rounded-xl mr-3 min-w-[80px] ${
        selected ? "border-2 border-blue-500 bg-blue-50" : "bg-gray-100"
      }`}
    >
      <Text className="text-3xl mb-1">{icon}</Text>
      <Text
        className={`text-sm font-medium ${selected ? "text-green-600" : "text-gray-700"}`}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}
