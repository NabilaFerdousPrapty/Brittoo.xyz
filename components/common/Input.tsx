import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 mb-2 font-medium">{label}</Text>}
      <TextInput
        className={`border ${error ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-3 text-base bg-white ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
