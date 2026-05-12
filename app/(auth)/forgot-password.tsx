// app/(auth)/forgot-password.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../store/useAuthStore";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const { forgotPassword, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email.trim()) return Alert.alert("Error", "Please enter your email");
    const result = await forgotPassword(email);
    if (result.success) {
      Alert.alert("Reset Link Sent", "Check your email for instructions");
      router.back();
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <LinearGradient
      colors={["#ffffff", "#f9fafb"]}
      style={{ flex: 1, justifyContent: "center" }}
    >
      <View className="px-6">
        <View className="bg-white rounded-3xl p-8 shadow-lg">
          <Text className="text-2xl font-bold text-center mb-4">
            Reset Password
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            We'll send a reset link to your email address
          </Text>
          <TextInput
            placeholder="Your RUET email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="border border-gray-300 rounded-xl px-4 py-3 mb-6 bg-gray-50"
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className="bg-green-600 py-3 rounded-xl"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">
                Send Reset Link
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text className="text-center text-gray-600">Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
