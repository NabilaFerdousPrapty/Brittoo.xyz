import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuthStore } from "../../store/useAuthStore";

export default function Login() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      const success = await login(email, password);
      if (success) {
        router.back();
      } else {
        setErrors({ email: "Invalid email or password" });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      {/* Background Decoration */}
      <View className="absolute top-0 right-0 w-64 h-64 bg-green-100 rounded-full -mr-32 -mt-32 opacity-50" />
      <View className="absolute bottom-0 left-0 w-80 h-80 bg-green-50 rounded-full -ml-40 -mb-40 opacity-50" />

      <View className="flex-1 justify-center p-6">
        {/* Logo and Header Section */}
        <View className="items-center mb-10">
          {/* Logo with Shadow - Fixed Version */}
          <View className="relative mb-4">
            <View className="absolute inset-0 bg-green-400 rounded-full opacity-20 blur-xl transform scale-150" />

            {/* Shadow container for image */}
            <View
              className="rounded-2xl bg-white p-2"
              style={{
                shadowColor: "#15803d",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Image
                source={require("../../assets/images/brittoo-logo.png")}
                className="w-24 h-24"
                resizeMode="contain"
              />
            </View>

            {/* Small Decorative Badge */}
            <View className="absolute -bottom-2 -right-2 bg-green-500 rounded-full px-3 py-1 shadow-md">
              <Text className="text-white text-xs font-bold">RENT</Text>
            </View>
          </View>

          {/* Brand Name */}
          <Text className="text-3xl font-bold text-green-700 mb-2">
            Welcome Back!
          </Text>

          <Text className="text-gray-500 text-base">
            Login to continue your rental journey
          </Text>
        </View>

        {/* Form Section */}
        <View className="space-y-4">
          {/* Email Input with Icon */}
          <View className="relative">
            <View className="absolute left-3 top-4 z-10">
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            </View>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              className="pl-10"
            />
          </View>

          {/* Password Input with Icon and Toggle */}
          <View className="relative">
            <View className="absolute left-3 top-4 z-10">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            </View>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={errors.password}
              className="pl-10"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4 z-10"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="self-end">
            <Text className="text-green-600 text-sm font-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          size="lg"
          className="mt-6 bg-green-500"
        />

        {/* OR Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="mx-4 text-gray-400 text-sm">OR</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Sign Up Link */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          className="mt-2"
        >
          <Text className="text-center text-gray-600">
            Don't have an account?{" "}
            <Text className="text-green-600 font-bold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
