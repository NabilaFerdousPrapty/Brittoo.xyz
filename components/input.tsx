import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "border-red-300"
    : focused
      ? "border-gray-400"
      : "border-gray-100";

  const bgColor = focused ? "bg-white" : "bg-gray-50";

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-500 text-xs font-medium mb-1.5 ml-0.5">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center ${bgColor} border ${borderColor} rounded-xl px-3`}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={16}
            color={focused ? "#374151" : "#9ca3af"}
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          className="flex-1 text-gray-900 py-3 text-sm"
          placeholderTextColor="#d1d5db"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((p) => !p)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={16}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={rightIcon} size={16} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text className="text-red-400 text-xs mt-1 ml-0.5">{error}</Text>
      ) : hint ? (
        <Text className="text-gray-400 text-xs mt-1 ml-0.5">{hint}</Text>
      ) : null}
    </View>
  );
};
