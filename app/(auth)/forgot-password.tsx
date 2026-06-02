import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { forgotPassword } from "../../hooks/api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      if (res.data.success) {
        setSent(true);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Something went wrong";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-100 items-center">
          <Image
            source={require("../../assets/images/brittoo-logo.png")}
            style={{ width: 160, height: 60 }}
            resizeMode="contain"
            className="mb-6"
          />
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="checkmark" size={40} color="#16a34a" />
          </View>
          <Text className="text-gray-800 text-2xl font-bold text-center mb-3">
            Check your inbox
          </Text>
          <Text className="text-gray-500 text-sm text-center leading-6 mb-8">
            If an account exists for{" "}
            <Text className="text-gray-900 font-medium">{email}</Text>, we've
            sent a password reset link. It expires in 15 minutes.
          </Text>
          <Button
            label="Back to Login"
            onPress={() => router.replace("/(auth)/login")}
            variant="ghost"
            size="lg"
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-4 py-10">
        <View className="bg-white rounded-3xl shadow-xl px-6 py-8 border border-gray-100">
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6 self-start"
          >
            <Ionicons name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>

          {/* Brittoo Logo */}
          <View className="items-center mb-6">
            <Image
              source={require("../../assets/images/brittoo-logo.png")}
              style={{ width: 160, height: 60 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-gray-800 text-2xl font-bold text-center mb-2">
            Forgot password?
          </Text>
          <Text className="text-gray-500 text-sm text-center mb-8 leading-6">
            No worries! Enter your university email and we'll send you a reset
            link.
          </Text>

          <Input
            label="University Email"
            placeholder="your@university.edu"
            leftIcon="mail-outline"
            value={email}
            onChangeText={setEmail}
            error={error}
            keyboardType="email-address"
            autoComplete="email"
          />

          {/* Info card */}
          <View className="flex-row items-start gap-2 bg-blue-50/30 border border-blue-100 rounded-xl p-3 mb-8">
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#6b7280"
            />
            <Text className="text-gray-500 text-xs flex-1 leading-5">
              Maximum 3 reset requests per 24 hours
            </Text>
          </View>

          <Button
            label="Send Reset Link"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            className="mb-4 bg-[#16A34A] border-[#16A34A] shadow-md"
          />

          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/(auth)/login")}
          >
            <Text className="text-green-500 text-sm font-medium">
              Back to sign in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
