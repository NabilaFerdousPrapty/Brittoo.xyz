import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { STORAGE_KEYS } from "../../constants";
import { loginUser } from "../../hooks/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await loginUser(email.trim().toLowerCase(), password);
      if (res.data.success) {
        await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, res.data.token);
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER,
          JSON.stringify(res.data.user),
        );
        router.replace("/(tabs)/browse");
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "Login failed";
      if (status === 429) {
        Alert.alert("Too many attempts", msg);
      } else if (status === 401) {
        setErrors({ password: "Incorrect email or password" });
      } else {
        Alert.alert("Sign in failed", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-14 pb-10 justify-between">
          <View>
            {/* Logo mark */}
            <View className="w-10 h-10 bg-gray-900 rounded-xl items-center justify-center mb-8">
              <Text className="text-white text-lg font-semibold">B</Text>
            </View>

            <Text className="text-gray-900 text-2xl font-semibold mb-1">
              Welcome back
            </Text>
            <Text className="text-gray-400 text-sm mb-10">
              Sign in to Brittoo
            </Text>

            <Input
              label="University email"
              placeholder="your@university.edu"
              leftIcon="mail-outline"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoComplete="email"
            />

            {/* Password field with forgot link */}
            <View>
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-gray-500 text-xs font-medium ml-0.5">
                  Password
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-password")}
                >
                  <Text className="text-gray-900 text-xs font-semibold">
                    Forgot?
                  </Text>
                </TouchableOpacity>
              </View>
              <Input
                placeholder="Your password"
                leftIcon="lock-closed-outline"
                isPassword
                value={password}
                onChangeText={setPassword}
                error={errors.password}
              />
            </View>

            <Button
              label="Sign in"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              className="mt-2 mb-6"
            />

            {/* Divider */}
            <View className="flex-row items-center gap-3 mb-6">
              <View className="flex-1 h-px bg-gray-100" />
              <Text className="text-gray-300 text-xs">or</Text>
              <View className="flex-1 h-px bg-gray-100" />
            </View>

            {/* Rate limit info card */}
            <View className="flex-row items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
              <Text className="text-base mt-0.5">🔒</Text>
              <Text className="text-gray-400 text-xs flex-1 leading-5">
                For security, sign-in is paused after 5 failed attempts within
                15 minutes.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center items-center gap-1 mt-8">
            <Text className="text-gray-400 text-sm">
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-gray-900 text-sm font-semibold">
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
