// app/(auth)/reset-password.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "../../store/useAuthStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function ResetPassword() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { resetPassword, isLoading } = useAuthStore();
  const router = useRouter();

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6)
      return Alert.alert("Error", "Password must be at least 6 characters");
    if (newPassword !== confirm)
      return Alert.alert("Error", "Passwords do not match");
    const result = await resetPassword(token, newPassword);
    if (result.success) {
      Alert.alert("Success", "Password changed. Please login.");
      router.push("/(auth)/login");
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
          <Text className="text-2xl font-bold text-center mb-6">
            Create New Password
          </Text>
          <TextInput
            placeholder="New password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-gray-50"
          />
          <TextInput
            placeholder="Confirm password"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            className="border border-gray-300 rounded-xl px-4 py-3 mb-6 bg-gray-50"
          />
          <TouchableOpacity
            onPress={handleReset}
            disabled={isLoading}
            className="bg-green-600 py-3 rounded-xl"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">
                Reset Password
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
