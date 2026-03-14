import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      const success = await login(email, password);
      if (success) {
        // Navigate to tabs on successful login
        router.replace("/(tabs)");
      } else {
        // Show error message but stay on login page
        Alert.alert(
          "Login Failed",
          "Invalid email or password. Please try again.",
          [{ text: "OK" }],
        );
      }
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen (create this if needed)
    Alert.alert(
      "Forgot Password",
      "Please contact support or reset your password.",
    );
  };

  const handleSignUp = () => {
    // Navigate to signup screen
    router.push("/(auth)/signup");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Background gradient */}
      <LinearGradient
        colors={["#ffffff", "#f9fafb"]}
        className="absolute inset-0"
      />
      <View className="absolute inset-0 opacity-[0.03]">
        {[...Array(6)].map((_, i) => (
          <View
            key={`v-${i}`}
            className="absolute h-full bg-gray-300"
            style={{ width: 1, left: `${(i + 1) * 16.66}%` }}
          />
        ))}
        {[...Array(4)].map((_, i) => (
          <View
            key={`h-${i}`}
            className="absolute w-full bg-gray-300"
            style={{ height: 1, top: `${(i + 1) * 20}%` }}
          />
        ))}
      </View>

      {/* Main content */}
      <View className="flex-1 justify-center px-6">
        <View
          className="bg-white rounded-3xl px-8 py-10 mx-auto w-full max-w-sm"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Logo */}
          <View className="items-center mb-7">
            <View className="bg-green-50 rounded-3xl px-2 mb-3">
              <Image
                source={require("../../assets/images/brittoo-logo.png")}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>
            <Text className="text-2xl font-semibold text-gray-900">
              Welcome back
            </Text>
            <Text className="text-sm text-gray-500 mt-1 text-center">
              Log in! That 8 AM class isn't getting any closer
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-5">
            {/* Email */}
            <View>
              <Text className="text-xs text-gray-600 mb-1">Email address</Text>
              <View className="relative">
                <Input
                  placeholder="john.doe@company.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#9CA3AF"
                  style={{ position: "absolute", left: 12, top: 14 }}
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-xs text-gray-600 mb-1">Password</Text>
              <View className="relative">
                <Input
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  className="pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#9CA3AF"
                  style={{ position: "absolute", left: 12, top: 14 }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: 14 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              className="self-end"
            >
              <Text className="text-xs text-gray-600 underline">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="mt-6 rounded-xl overflow-hidden"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#22c55e", "#15803d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-3.5 items-center justify-center"
            >
              <Text className="text-white text-base font-semibold">
                {isLoading ? "Signing in..." : "Sign In"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-3 text-xs text-gray-400">OR</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Sign-up prompt */}
          <TouchableOpacity onPress={handleSignUp}>
            <Text className="text-center text-sm text-gray-600">
              New to Brittoo?{" "}
              <Text className="text-green-700 font-semibold">Start here</Text>
            </Text>
          </TouchableOpacity>

          {/* Legal */}
          <Text className="text-center text-[10px] text-gray-400 mt-4">
            By signing in you agree to our{" "}
            <Text className="underline">Terms</Text> &{" "}
            <Text className="underline">Privacy</Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
