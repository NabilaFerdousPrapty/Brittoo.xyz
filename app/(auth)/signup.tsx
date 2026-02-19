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

export default function Signup() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
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
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-green-600 mb-2">
            Create Account
          </Text>
          <Text className="text-gray-500">Sign up to start renting items</Text>
        </View>

        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

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
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={errors.confirmPassword}
        />

        <Button
          title="Sign Up"
          onPress={handleSignup}
          loading={isLoading}
          size="lg"
          className="mt-4"
        />

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="mt-6"
        >
          <Text className="text-center text-gray-600">
            Already have an account?{" "}
            <Text className="text-green-600 font-semibold">Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
