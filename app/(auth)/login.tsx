import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Input from "../../components/common/Input";
import { mockUsers } from "../../constants/newMockdata";
import { useAuthStore } from "../../store/useAuthStore";

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  // Debug: Log available users
  useEffect(() => {
    console.log("=== AVAILABLE MOCK USERS ===");
    console.log("Total users:", mockUsers.length);
    if (mockUsers[0]) {
      console.log("User 1 - Email:", mockUsers[0].email);
      console.log("User 1 - Password:", mockUsers[0].password);
    }
    if (mockUsers[1]) {
      console.log("User 2 - Email:", mockUsers[1].email);
      console.log("User 2 - Password:", mockUsers[1].password);
    }
  }, []);

  const mockCredentials = {
    email: "1901001@student.ruet.ac.bd",
    password: "password123",
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
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
    if (!validateForm()) return;

    console.log("Attempting login with:", email, password);
    const success = await login(email, password);
    console.log("Login success:", success);

    if (success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert(
        "Login Failed",
        error || "Invalid email or password. Please try again.",
        [{ text: "OK" }],
      );
    }
  };

  const clearStorage = async () => {
    await AsyncStorage.clear();
    console.log("Storage cleared");
    Alert.alert("Storage Cleared", "Please restart the app");
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/(auth)/signup");
  };

  const fillDemoCredentials = () => {
    setEmail(mockCredentials.email);
    setPassword(mockCredentials.password);
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <LinearGradient
        colors={["#ffffff", "#f9fafb"]}
        className="absolute inset-0"
      />
      <View className="absolute inset-0 opacity-[0.03]">
        {[...Array(6)].map((_, i) => (
          <View
            key={`v-${i}`}
            className="absolute h-full bg-gray-300"
            style={{ width: 1, left: `${(i + 1) * 16.66}%` }}
          />
        ))}
        {[...Array(4)].map((_, i) => (
          <View
            key={`h-${i}`}
            className="absolute w-full bg-gray-300"
            style={{ height: 1, top: `${(i + 1) * 20}%` }}
          />
        ))}
      </View>

      <View className="flex-1 justify-center px-6">
        <View
          className="bg-white rounded-3xl px-8 py-10 mx-auto w-full max-w-sm"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          <View className="items-center mb-7">
            <View className="bg-green-50 rounded-3xl px-2 mb-3">
              <Image
                source={require("../../assets/images/brittoo-logo.png")}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>
            <Text className="text-2xl font-semibold text-gray-900">
              Welcome back
            </Text>
            <Text className="text-sm text-gray-500 mt-1 text-center">
              Log in! That 8 AM class isn't getting any closer
            </Text>
          </View>

          <View className="mb-4 p-3 bg-blue-50 rounded-lg">
            <Text className="text-xs text-blue-800 font-medium mb-1">
              Demo Credentials:
            </Text>
            <Text className="text-xs text-blue-600">
              Email: {mockCredentials.email}
            </Text>
            <Text className="text-xs text-blue-600">
              Password: {mockCredentials.password}
            </Text>
            <TouchableOpacity onPress={fillDemoCredentials} className="mt-2">
              <Text className="text-xs text-green-600 font-medium">
                Tap to fill demo credentials
              </Text>
            </TouchableOpacity>
            {/* Debug button - remove after testing */}
            <TouchableOpacity onPress={clearStorage} className="mt-2">
              <Text className="text-xs text-red-500">
                Clear Storage (Debug)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rest of your form remains the same */}
          <View className="space-y-5">
            <View>
              <Text className="text-xs text-gray-600 mb-1">Email address</Text>
              <View className="relative">
                <Input
                  placeholder="1901001@student.ruet.ac.bd"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email)
                      setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email}
                  className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#9CA3AF"
                  style={{ position: "absolute", left: 12, top: 14 }}
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.email}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-xs text-gray-600 mb-1">Password</Text>
              <View className="relative">
                <Input
                  placeholder="••••••••"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password)
                      setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  className="pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#9CA3AF"
                  style={{ position: "absolute", left: 12, top: 14 }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: 14 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.password}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              className="self-end"
            >
              <Text className="text-xs text-gray-600 underline">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="mt-6 rounded-xl overflow-hidden"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isLoading ? ["#9CA3AF", "#6B7280"] : ["#22c55e", "#15803d"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-3.5 items-center justify-center"
            >
              <Text className="text-white text-base font-semibold">
                {isLoading ? "Signing in..." : "Sign In"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-3 text-xs text-gray-400">OR</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <TouchableOpacity onPress={handleSignUp}>
            <Text className="text-center text-sm text-gray-600">
              New to Brittoo?{" "}
              <Text className="text-green-700 font-semibold">Start here</Text>
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-[10px] text-gray-400 mt-4">
            By signing in you agree to our{" "}
            <Text className="underline">Terms</Text> &{" "}
            <Text className="underline">Privacy</Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
