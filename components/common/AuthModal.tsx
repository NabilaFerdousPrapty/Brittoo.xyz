import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Button from "./Button";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({
  visible,
  onClose,
  message = "Please login to view product details",
}: AuthModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push("/(auth)/login");
  };

  const handleSignup = () => {
    onClose();
    router.push("/(auth)/signup");
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-xl p-6 w-11/12 max-w-md">
          <Text className="text-2xl font-bold text-center mb-2">
            Login Required
          </Text>
          <Text className="text-gray-600 text-center mb-6">{message}</Text>

          <Button
            title="Login"
            onPress={handleLogin}
            size="lg"
            className="mb-3"
          />

          <Button
            title="Create Account"
            variant="outline"
            onPress={handleSignup}
            size="lg"
          />

          <TouchableOpacity onPress={onClose} className="mt-4">
            <Text className="text-gray-500 text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
