import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { resetPassword } from "../hooks/api";

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [manualToken, setManualToken] = useState(token ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!manualToken.trim()) e.token = "Reset token is required";
    if (!password) e.password = "Password is required";
    if (password.length < 6) e.password = "Minimum 6 characters";
    if (password !== confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await resetPassword(manualToken.trim(), password);
      if (res.data.success) setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Reset failed";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-[#0a0a14] px-6 items-center justify-center pb-8">
        <View className="w-20 h-20 bg-[#22c55e]/20 border border-[#22c55e]/40 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle-outline" size={40} color="#22c55e" />
        </View>
        <Text className="text-[#f1f5f9] text-2xl font-bold text-center mb-3">
          Password Reset!
        </Text>
        <Text className="text-[#6b7280] text-sm text-center leading-6 mb-8">
          Your password has been successfully updated. You can now sign in with
          your new password.
        </Text>
        <Button
          label="Sign In"
          onPress={() => router.replace("/(auth)/login")}
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
          <Ionicons name="lock-open-outline" size={28} color="#6c63ff" />
        </View>

        <Text className="text-[#f1f5f9] text-3xl font-bold mb-2">
          New password
        </Text>
        <Text className="text-[#6b7280] text-sm mb-10 leading-6">
          Set a strong new password for your account
        </Text>

        {!token && (
          <Input
            label="Reset Token"
            placeholder="Paste your reset token"
            leftIcon="key-outline"
            value={manualToken}
            onChangeText={setManualToken}
            error={errors.token}
            hint="Copy the token from your email link"
          />
        )}

        <Input
          label="New Password"
          placeholder="Min. 6 characters"
          leftIcon="lock-closed-outline"
          isPassword
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          placeholder="Re-enter new password"
          leftIcon="shield-checkmark-outline"
          isPassword
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
        />

        <View className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-3 mb-8 flex-row items-center gap-2">
          <Ionicons name="time-outline" size={14} color="#f59e0b" />
          <Text className="text-[#f59e0b] text-xs flex-1">
            Reset links expire after 15 minutes
          </Text>
        </View>

        <Button
          label="Reset Password"
          onPress={handleReset}
          loading={loading}
          size="lg"
        />
      </View>
    </KeyboardAvoidingView>
  );
}
