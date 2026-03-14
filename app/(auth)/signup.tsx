import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuthStore } from "../../store/useAuthStore";

export default function Signup() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name) {
      newErrors.name = "Name is required";
    }

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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (validateForm()) {
      const success = await signup(name, email, password);
      if (success) {
        router.back();
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Elegant Gradient Background */}
      <LinearGradient
        colors={["#ffffff", "#f9fafb"]}
        className="absolute inset-0"
      />

      {/* Decorative Elements */}
      <View className="absolute top-0 right-0 w-48 h-48 bg-green-50 rounded-bl-full opacity-60" />
      <View className="absolute bottom-0 left-0 w-48 h-48 bg-green-50 rounded-tr-full opacity-60" />

      {/* Subtle Grid Pattern */}
      <View className="absolute inset-0 opacity-[0.02]">
        {[...Array(6)].map((_, i) => (
          <View
            key={`v-${i}`}
            className="absolute h-full bg-gray-400"
            style={{ width: 1, left: `${(i + 1) * 16.66}%` }}
          />
        ))}
        {[...Array(4)].map((_, i) => (
          <View
            key={`h-${i}`}
            className="absolute w-full bg-gray-400"
            style={{ height: 1, top: `${(i + 1) * 20}%` }}
          />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Main Card Container */}
          <View
            className="bg-white rounded-3xl px-8 py-8 mx-auto w-full max-w-sm"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.05,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {/* Logo and Header Section */}
            <View className="items-center mb-8">
              {/* Logo Container with Shadow */}
              <View
                className="rounded-2xl bg-white p-3 mb-4"
                style={{
                  shadowColor: "#15803d",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <View className="bg-green-50 rounded-2xl p-2">
                  <Image
                    source={require("../../assets/images/brittoo-logo.png")}
                    className="w-16 h-10"
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Header Text with Enhanced Typography */}
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Oh, Look Who's Here!
              </Text>
              <View className="flex-row items-center">
                <View className="w-8 h-px bg-green-200 mr-2" />
                <Text className="text-gray-500 text-base font-light">
                  Let's get you signed up
                </Text>
                <View className="w-8 h-px bg-green-200 ml-2" />
              </View>
            </View>

            {/* Form Fields with Enhanced Styling */}
            <View className="space-y-4">
              {/* Full Name Field */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  Full Name
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                  </View>
                  <Input
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                    error={errors.name}
                    className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Email Field */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  Email Address
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                  </View>
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  Password
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#9CA3AF"
                    />
                  </View>
                  <Input
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    error={errors.password}
                    className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Confirm Password Field */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  Confirm Password
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={18}
                      color="#9CA3AF"
                    />
                  </View>
                  <Input
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    error={errors.confirmPassword}
                    className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Terms and Conditions Checkbox */}
              <View className="mt-4">
                <TouchableOpacity
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  className="flex-row items-start"
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-5 h-5 rounded-md border-2 mr-3 mt-0.5 items-center justify-center ${
                      termsAccepted
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {termsAccepted && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text className="flex-1 text-sm text-gray-600 leading-5">
                    I agree to the{" "}
                    <Text className="text-green-600 font-semibold">
                      Terms of Service
                    </Text>{" "}
                    and{" "}
                    <Text className="text-green-600 font-semibold">
                      Privacy Policy
                    </Text>
                  </Text>
                </TouchableOpacity>
                {errors.terms && (
                  <Text className="text-red-500 text-xs mt-1 ml-8">
                    {errors.terms}
                  </Text>
                )}
              </View>
            </View>

            {/* Sign Up Button with Gradient */}
            <View className="mt-8">
              <Button
                title="Sign Up"
                onPress={handleSignup}
                loading={isLoading}
                size="lg"
                className={`rounded-xl overflow-hidden ${
                  !termsAccepted ? "opacity-50" : ""
                }`}
                disabled={!termsAccepted}
              />
            </View>

            {/* Decorative Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-400 text-sm font-medium">
                Already registered?
              </Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Login Link with Enhanced Styling */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              className="mt-2"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-gray-600 text-base">
                  Already have an account?{" "}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-green-600 font-bold text-base">
                    Login
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="#059669"
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
