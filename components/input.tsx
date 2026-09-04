
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

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

  // ----------------------------------------------------------
  // Animations
  // ----------------------------------------------------------

  const focusAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const handleFocus = (e: any) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    props.onBlur?.(e);
  };

  const togglePassword = () => {
    Animated.sequence([
      Animated.timing(passwordAnim, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(passwordAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    setShowPassword((p) => !p);
  };

  // ----------------------------------------------------------
  // Animated values
  // ----------------------------------------------------------

  const scale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.008],
  });

  const iconOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  const eyeScale = passwordAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.82],
  });

  // ----------------------------------------------------------
  // Colors
  // ----------------------------------------------------------

  const borderColor = error
    ? "#FCA5A5"
    : focused
      ? "#16A34A"
      : "#DCEFE2";

  const backgroundColor = focused
    ? "#FFFFFF"
    : "#F7FBF8";

  const iconColor = error
    ? "#DC2626"
    : focused
      ? "#16A34A"
      : "#789181";

  const labelColor = focused
    ? "#166534"
    : "#64806C";

  return (
    <View className="mb-4">
      {/* ---------------------------------------------------- */}
      {/* Label */}
      {/* ---------------------------------------------------- */}

      {label && (
        <Text
          className="text-xs font-semibold mb-1.5 ml-0.5"
          style={{
            color: labelColor,
          }}
        >
          {label}
        </Text>
      )}

      {/* ---------------------------------------------------- */}
      {/* Input Container */}
      {/* ---------------------------------------------------- */}

      <Animated.View
        style={{
          transform: [{ scale }],
          borderColor,
          backgroundColor,
        }}
        className="flex-row items-center border rounded-xl px-3"
      >
        {/* Left Icon */}

        {leftIcon && (
          <Animated.View
            style={{
              opacity: iconOpacity,
            }}
          >
            <Ionicons
              name={leftIcon}
              size={17}
              color={iconColor}
              style={{
                marginRight: 9,
              }}
            />
          </Animated.View>
        )}

        {/* Text Input */}

        <TextInput
          className="flex-1 text-[#16301F] py-3 text-sm"
          placeholderTextColor="#9AAF9F"
          secureTextEntry={
            isPassword && !showPassword
          }
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          selectionColor="#16A34A"
          {...props}
        />

        {/* -------------------------------------------------- */}
        {/* Password Eye */}
        {/* -------------------------------------------------- */}

        {isPassword && (
          <TouchableOpacity
            onPress={togglePassword}
            activeOpacity={0.7}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Animated.View
              style={{
                transform: [{ scale: eyeScale }],
              }}
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={18}
                color={
                  focused
                    ? "#16A34A"
                    : "#789181"
                }
              />
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* -------------------------------------------------- */}
        {/* Right Icon */}
        {/* -------------------------------------------------- */}

        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            activeOpacity={0.7}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Ionicons
              name={rightIcon}
              size={17}
              color={
                focused
                  ? "#16A34A"
                  : "#789181"
              }
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* ---------------------------------------------------- */}
      {/* Error */}
      {/* ---------------------------------------------------- */}

      {error ? (
        <Animated.View
          style={{
            opacity: 1,
          }}
        >
          <Text className="text-[#DC2626] text-xs mt-1 ml-0.5">
            {error}
          </Text>
        </Animated.View>
      ) : hint ? (
        <Text className="text-[#789181] text-xs mt-1 ml-0.5">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}