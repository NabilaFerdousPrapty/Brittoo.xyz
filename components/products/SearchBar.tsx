import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isAiMode?: boolean;
  onToggleAi?: () => void;
}

export const SearchBar: React.FC<Props> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search products...",
  isAiMode = false,
  onToggleAi,
}) => (
  <View className="flex-row items-center gap-2 px-4 py-2">
    <View
      className={`flex-1 flex-row items-center border rounded-xl px-3 bg-gray-50 ${
        isAiMode ? "border-violet-300 bg-violet-50" : "border-gray-200"
      }`}
    >
      <Ionicons
        name={isAiMode ? "sparkles-outline" : "search-outline"}
        size={16}
        color={isAiMode ? "#7c3aed" : "#9ca3af"}
        style={{ marginRight: 8 }}
      />
      <TextInput
        className={`flex-1 py-2.5 text-sm ${isAiMode ? "text-violet-900" : "text-gray-900"}`}
        placeholder={isAiMode ? "Describe what you need..." : placeholder}
        placeholderTextColor={isAiMode ? "#a78bfa" : "#d1d5db"}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange("")}>
          <Ionicons name="close-circle" size={16} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>

    {/* AI toggle button */}
    {onToggleAi && (
      <TouchableOpacity
        onPress={onToggleAi}
        className={`w-10 h-10 rounded-xl items-center justify-center border ${
          isAiMode ? "bg-violet-600 border-violet-600" : "bg-white border-gray-200"
        }`}
        activeOpacity={0.8}
      >
        <Ionicons
          name="sparkles-outline"
          size={18}
          color={isAiMode ? "#fff" : "#6b7280"}
        />
      </TouchableOpacity>
    )}
  </View>
);
