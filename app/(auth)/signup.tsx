// app/(auth)/signup.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuthStore } from "../../store/useAuthStore";

export default function Signup() {
  const router = useRouter();
  const { signup, isLoading, error } = useAuthStore();

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

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^.+@student\.ruet\.ac\.bd$/.test(email))
      newErrors.email = "Use your RUET student email (@student.ruet.ac.bd)";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!termsAccepted)
      newErrors.terms = "You must accept the Terms & Privacy policy";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    const result = await signup(name, email, password);
    if (result.success && result.email) {
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email: result.email },
      });
    } else {
      Alert.alert("Signup Failed", result.error || error || "Unknown error");
    }
  };

  return (
    <LinearGradient colors={["#ffffff", "#f9fafb"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View className="px-6 py-8">
          <View className="bg-white rounded-3xl p-8 shadow-lg">
            <View className="items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">
                Create Account
              </Text>
              <Text className="text-gray-500 text-center mt-1">
                Join Brittoo and never miss a class
              </Text>
            </View>

            <View className="space-y-4">
              <Input
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                error={errors.name}
                leftIcon={
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                }
              />
              <Input
                placeholder="your_roll@student.ruet.ac.bd"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email}
                leftIcon={
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                }
              />
              <Input
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#9CA3AF"
                  />
                }
              />
              <Input
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.confirmPassword}
                leftIcon={
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color="#9CA3AF"
                  />
                }
              />

              <TouchableOpacity
                onPress={() => setTermsAccepted(!termsAccepted)}
                className="flex-row items-center mt-2"
                activeOpacity={0.7}
              >
                <View
                  className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${termsAccepted ? "bg-green-500 border-green-500" : "border-gray-300"}`}
                >
                  {termsAccepted && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text className="text-sm text-gray-600">
                  I agree to the Terms & Privacy
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.terms}
                </Text>
              )}
            </View>

            <Button
              title="Sign Up"
              onPress={handleSignup}
              loading={isLoading}
              disabled={!termsAccepted}
              className="mt-8 rounded-xl"
            />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              className="mt-6"
            >
              <Text className="text-center text-gray-600">
                Already have an account?{" "}
                <Text className="text-green-600 font-bold">Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
