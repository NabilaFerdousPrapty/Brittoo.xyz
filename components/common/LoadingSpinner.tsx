import React from "react";
import { ActivityIndicator, View } from "react-native";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  fullScreen = false,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="py-4 justify-center items-center">
      <ActivityIndicator size="small" color="#3B82F6" />
    </View>
  );
}
