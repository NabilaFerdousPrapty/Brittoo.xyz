// components/common/Button.tsx
import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  label?: string; // Support for both prop names
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  title,
  label,
  loading = false,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  // Use title or label, fallback to children
  const buttonText =
    title || label || (typeof children === "string" ? children : "");

  const baseStyles =
    "rounded-full items-center justify-center font-semibold flex-row gap-2 transition-all active:scale-95";

  const variantStyles = {
    primary: "bg-emerald-500 shadow-md shadow-emerald-200",
    secondary: "bg-emerald-600 shadow-md shadow-emerald-200",
    outline: "bg-transparent border-2 border-emerald-500",
    danger: "bg-red-500 shadow-md shadow-red-200",
    ghost: "bg-transparent",
  };

  const sizeStyles = {
    sm: "px-4 py-2 min-w-[80px]",
    md: "px-6 py-3 min-w-[120px]",
    lg: "px-8 py-4 min-w-[160px]",
  };

  const textStyles = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-emerald-600",
    danger: "text-white",
    ghost: "text-emerald-600",
  };

  const textSizeStyles = {
    sm: "text-sm font-semibold",
    md: "text-base font-semibold",
    lg: "text-lg font-bold",
  };

  return (
    <TouchableOpacity
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled || loading ? "opacity-50" : ""} ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" ? "#10b981" : "white"
          }
          size={size === "sm" ? "small" : "small"}
        />
      ) : (
        <>
          {leftIcon && leftIcon}
          <Text className={`${textStyles[variant]} ${textSizeStyles[size]}`}>
            {buttonText}
          </Text>
          {rightIcon && rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}
