// components/common/Input.tsx
import React from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface InputProps extends TextInputProps {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export default function Input({
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerClassName = "",
  className = "",
  ...rest
}: InputProps) {
  return (
    <View className={`w-full ${containerClassName}`}>
      <View className="relative">
        {leftIcon && (
          <View className="absolute left-3 top-3.5 z-10">{leftIcon}</View>
        )}
        <TextInput
          className={`bg-gray-50 border border-gray-200 rounded-xl text-gray-800 py-3 px-4 ${
            leftIcon ? "pl-10" : ""
          } ${rightIcon ? "pr-10" : ""} ${className}`}
          placeholderTextColor="#9CA3AF"
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            className="absolute right-3 top-3.5 z-10"
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
