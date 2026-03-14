import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (validateForm()) {
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setIsEmailSent(true);
      }, 1500);
    }
  };

  const handleResendEmail = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Email Resent",
        "A new reset link has been sent to your email.",
        [{ text: "OK" }],
      );
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#ffffff", "#f9fafb"]}
        className="absolute inset-0"
      />

      {/* Decorative Elements */}
      <View className="absolute top-0 right-0 w-48 h-48 bg-green-50 rounded-bl-full opacity-60" />
      <View className="absolute bottom-0 left-0 w-48 h-48 bg-green-50 rounded-tr-full opacity-60" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Main Card */}
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
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute top-4 left-4 z-10"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                <Ionicons name="arrow-back" size={20} color="#374151" />
              </View>
            </TouchableOpacity>

            {/* Logo */}
            <View className="items-center mb-8">
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
            </View>

            {!isEmailSent ? (
              <>
                {/* Header Text */}
                <View className="items-center mb-8">
                  <Text className="text-2xl font-bold text-gray-900 mb-2">
                    Forgot Password?
                  </Text>
                  <Text className="text-gray-500 text-center text-base">
                    Don't worry! It happens. Please enter your email address and
                    we'll send you a reset link.
                  </Text>
                </View>

                {/* Email Input */}
                <View className="mb-6">
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

                {/* Reset Button */}
                <Button
                  title="Send Reset Link"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  size="lg"
                  className="bg-green-500 rounded-xl overflow-hidden"
                />

                {/* Back to Login */}
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/login")}
                  className="mt-6"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="arrow-back" size={16} color="#059669" />
                    <Text className="text-green-600 font-semibold ml-2">
                      Back to Login
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Success State */}
                <View className="items-center mb-8">
                  {/* Success Animation Placeholder */}
                  <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
                    <Ionicons
                      name="checkmark-circle"
                      size={48}
                      color="#10B981"
                    />
                  </View>

                  <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    Check Your Email
                  </Text>
                  <Text className="text-gray-500 text-center text-base mb-2">
                    We've sent a password reset link to:
                  </Text>
                  <Text className="text-green-600 font-semibold text-lg mb-4">
                    {email}
                  </Text>
                  <Text className="text-gray-500 text-center text-sm">
                    Click the link in the email to reset your password. If you
                    don't see it, check your spam folder.
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="space-y-3">
                  <Button
                    title="Open Email App"
                    onPress={() => {
                      // This would open the email app
                      Alert.alert(
                        "Demo",
                        "This would open the device's email app",
                      );
                    }}
                    size="lg"
                    className="bg-green-500 rounded-xl overflow-hidden"
                  />

                  <TouchableOpacity
                    onPress={handleResendEmail}
                    disabled={isLoading}
                    className="py-3"
                    activeOpacity={0.7}
                  >
                    <Text className="text-center text-gray-600">
                      Didn't receive the email?{" "}
                      <Text className="text-green-600 font-semibold">
                        Resend
                      </Text>
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/login")}
                    className="mt-4"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="arrow-back" size={16} color="#059669" />
                      <Text className="text-green-600 font-semibold ml-2">
                        Back to Login
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Help Text */}
            <View className="mt-8 pt-6 border-t border-gray-100">
              <Text className="text-center text-xs text-gray-400">
                Having trouble?{" "}
                <Text
                  className="text-green-600 underline"
                  onPress={() => {
                    Alert.alert(
                      "Need Help?",
                      "Please contact our support team at support@brittoo.com or via WhatsApp: https://wa.link/2fcbvl",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Contact Support",
                          onPress: () => {
                            // This would open WhatsApp or email
                            Alert.alert("Demo", "This would open support chat");
                          },
                        },
                      ],
                    );
                  }}
                >
                  Contact Support
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
