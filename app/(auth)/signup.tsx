import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { registerUser } from "../../hooks/api";

const UNIVERSITY_HINT =
  "RUET: 2010033@student.ruet.ac.bd\nFormat: [roll]@student.ruet.ac.bd";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const set = (field: string) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    // Add RUET email format validation
    const emailRegex = /^\d+@student\.ruet\.ac\.bd$/;

    if (!form.password) e.password = "Password is required";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (res.data.success) {
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { email: form.email.trim().toLowerCase() },
        });
      }
    } catch (err: any) {
      let errorMessage = "Registration failed. Please try again.";

      // 🔍 Show the real backend message
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      // Network errors (Docker unreachable)
      else if (err.message === "Network Error") {
        errorMessage = `Cannot connect to backend.\n\nMake sure:\n• Docker container is running (docker ps)\n• Port 5000 is mapped (-p 5000:5000)\n• Android emulator uses 10.0.2.2`;
      } else if (err.code === "ECONNREFUSED") {
        errorMessage = "Connection refused. Is the backend running?";
      }

      Alert.alert("Registration Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-4 py-10">
          <View className="bg-white rounded-3xl shadow-xl px-6 py-8 border border-gray-100">
            {/* Brittoo Logo */}
            <View className="items-center mb-6">
              <Image
                source={require("../../assets/images/brittoo-logo.png")}
                style={{ width: 160, height: 60 }}
                resizeMode="contain"
              />
            </View>

            <Text className="text-gray-800 text-2xl font-bold text-center mb-1">
              Create account
            </Text>
            <Text className="text-gray-500 text-sm text-center mb-8">
              Join your university network
            </Text>

            {/* Name */}
            <Input
              label="Full name"
              placeholder="Your full name"
              leftIcon="person-outline"
              value={form.name}
              onChangeText={set("name")}
              error={errors.name}
              autoComplete="name"
            />

            {/* Email with hint */}
            <View>
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-gray-500 text-xs font-medium ml-0.5">
                  University email
                </Text>
                <TouchableOpacity
                  onPress={() => setShowHint((h) => !h)}
                  className="flex-row items-center gap-1"
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={13}
                    color="#9ca3af"
                  />
                  <Text className="text-gray-400 text-xs">
                    Supported formats
                  </Text>
                </TouchableOpacity>
              </View>

              {showHint && (
                <View className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-2">
                  <Text className="text-gray-500 text-xs leading-5">
                    {UNIVERSITY_HINT}
                  </Text>
                </View>
              )}

              <Input
                placeholder="your@university.edu"
                leftIcon="mail-outline"
                value={form.email}
                onChangeText={set("email")}
                error={errors.email}
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <Input
              label="Password"
              placeholder="Min. 6 characters"
              leftIcon="lock-closed-outline"
              isPassword
              value={form.password}
              onChangeText={set("password")}
              error={errors.password}
            />

            <Input
              label="Confirm password"
              placeholder="Re-enter password"
              leftIcon="shield-checkmark-outline"
              isPassword
              value={form.confirm}
              onChangeText={set("confirm")}
              error={errors.confirm}
            />

            {/* University note - updated to only RUET */}
            {/* <View className="flex-row items-start gap-2 bg-blue-50/30 border border-blue-100 rounded-xl p-3 mb-6">
              <Ionicons name="school-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-xs flex-1 leading-5">
                Only RUET emails (@student.ruet.ac.bd) are accepted
              </Text>
            </View> */}

            <Button
              label="Create account"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              className="mb-4"
            />

            <View className="flex-row justify-center items-center gap-1">
              <Text className="text-gray-500 text-sm">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-gray-900 text-sm font-semibold">
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
