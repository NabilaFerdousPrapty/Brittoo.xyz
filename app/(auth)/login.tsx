import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/useAuthStore";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

export default function Login() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      const success = await login(email, password);
      if (success) {
        router.back();
      } else {
        setErrors({ email: "Invalid email or password" });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-green-600 mb-2">
            Welcome Back
          </Text>
          <Text className="text-gray-500">Login to continue renting items</Text>
        </View>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />

        <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          size="lg"
          className="mt-4"
        />

        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          className="mt-6"
        >
          <Text className="text-center text-gray-600">
            Don't have an account?{" "}
            <Text className="text-green-600 font-semibold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
