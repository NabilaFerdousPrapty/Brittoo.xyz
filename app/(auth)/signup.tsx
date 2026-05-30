import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { registerUser } from "../../hooks/api";

const UNIVERSITY_HINT =
  "RUET: 2010033@student.ruet.ac.bd\nRU: s2310876@ru.ac.bd\nBUET: 2212011@cse.buet.ac.bd\nSUST: 2024134111@student.sust.edu\nIUT: name@iut-dhaka.edu";

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
      const msg =
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
      Alert.alert("Error", msg);
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
        <View className="flex-1 px-6 pt-14 pb-10">
          {/* Logo mark */}
          <View className="w-10 h-10 bg-gray-900 rounded-xl items-center justify-center mb-8">
            <Text className="text-white text-lg font-semibold">B</Text>
          </View>

          <Text className="text-gray-900 text-2xl font-semibold mb-1">
            Create account
          </Text>
          <Text className="text-gray-400 text-sm mb-8">
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
                <Text className="text-gray-400 text-xs">Supported formats</Text>
              </TouchableOpacity>
            </View>

            {showHint && (
              <View className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-2">
                <Text className="text-gray-400 text-xs leading-5">
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

          {/* University note */}
          <View className="flex-row items-center gap-2 bg-gray-50 rounded-xl p-3 mb-6">
            <Ionicons name="school-outline" size={14} color="#9ca3af" />
            <Text className="text-gray-400 text-xs flex-1">
              Only RUET, RU, BUET, SUST, and IUT emails are accepted
            </Text>
          </View>

          <Button
            label="Create account"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            className="mb-4"
          />

          <View className="flex-row justify-center items-center gap-1">
            <Text className="text-gray-400 text-sm">
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-gray-900 text-sm font-semibold">
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
