// (app)/how-it-works.tsx

import HowItWorks from "@/components/cards/HowItWorks";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HowItWorksScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      {/* HowItWorks renders its own ScrollView + gradient hero, so it
          fills the whole screen — we just float a back button on top. */}
      <HowItWorks />

      <SafeAreaView
        edges={["top"]}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-black/20 items-center justify-center mt-2 ml-4"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}