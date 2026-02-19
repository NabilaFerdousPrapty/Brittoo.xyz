import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  title,
  loading = false,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "rounded-lg items-center justify-center font-semibold";

  const variantStyles = {
    primary: "bg-green-500",
    secondary: "bg-green-500",
    outline: "bg-transparent border-2 border-green-500",
    danger: "bg-red-500",
  };

  const sizeStyles = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  const textStyles = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-green-500",
    danger: "text-white",
  };

  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <TouchableOpacity
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled || loading ? "opacity-50" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#3B82F6" : "white"}
        />
      ) : (
        <Text
          className={`${textStyles[variant]} ${textSizeStyles[size]} font-semibold`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
