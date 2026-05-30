import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
      <View className="flex-1 bg-[#0a0a14] px-6 pt-14 pb-8 items-center justify-center">
        <View className="w-20 h-20 bg-[#00d4aa]/20 border border-[#00d4aa]/40 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle-outline" size={40} color="#00d4aa" />
        </View>
        <Text className="text-[#f1f5f9] text-2xl font-bold text-center mb-3">
          Check your inbox
        </Text>
        <Text className="text-[#6b7280] text-sm text-center leading-6 mb-8">
          If an account exists for{" "}
          <Text className="text-[#8b84ff]">{email}</Text>, we've sent a password
          reset link. It expires in 15 minutes.
        </Text>
        <Button
          label="Back to Login"
          onPress={() => router.replace("/(auth)/login")}
          variant="ghost"
          size="lg"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0a0a14]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-6 pt-14 pb-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 self-start"
        >
          <Ionicons name="arrow-back" size={24} color="#6c63ff" />
        </TouchableOpacity>

        <View className="w-16 h-16 bg-[#6c63ff]/20 border border-[#6c63ff]/40 rounded-3xl items-center justify-center mb-6">
          <Ionicons name="key-outline" size={28} color="#6c63ff" />
        </View>

        <Text className="text-[#f1f5f9] text-3xl font-bold mb-2">
          Forgot password?
        </Text>
        <Text className="text-[#6b7280] text-sm mb-10 leading-6">
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

        <View className="bg-[#1a1a2e] border border-[#2a2a40] rounded-xl p-3 mb-8 flex-row items-center gap-2">
          <Ionicons
            name="information-circle-outline"
            size={14}
            color="#6b7280"
          />
          <Text className="text-[#6b7280] text-xs flex-1">
            Maximum 3 reset requests per 24 hours
          </Text>
        </View>

        <Button
          label="Send Reset Link"
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          className="mb-4"
        />

        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-[#6c63ff] text-sm font-medium">
            Back to sign in
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
