import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

const variantStyles = {
  primary: {
    container: "bg-gray-900",
    text: "text-white font-semibold",
    indicator: "#ffffff",
  },
  secondary: {
    container: "bg-gray-100 border border-gray-200",
    text: "text-gray-900 font-medium",
    indicator: "#111827",
  },
  ghost: {
    container: "bg-transparent border border-gray-200",
    text: "text-gray-900 font-medium",
    indicator: "#111827",
  },
  danger: {
    container: "bg-red-500",
    text: "text-white font-semibold",
    indicator: "#ffffff",
  },
};

const sizeStyles = {
  sm: { container: "px-4 py-2.5 rounded-xl", text: "text-sm" },
  md: { container: "px-5 py-3.5 rounded-xl", text: "text-sm" },
  lg: { container: "px-6 py-4 rounded-xl", text: "text-base" },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  loading = false,
  variant = "primary",
  size = "md",
  icon,
  disabled,
  className,
  ...props
}) => {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      className={`${v.container} ${s.container} flex-row items-center justify-center gap-2 ${isDisabled ? "opacity-40" : ""} ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.indicator} />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          <Text className={`${v.text} ${s.text} tracking-wide`}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
