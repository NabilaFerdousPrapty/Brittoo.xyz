import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";
import { Button } from "../components/button";
import { STORAGE_KEYS } from "../constants";

export default function WelcomeScreen() {
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
    if (token) router.replace("/dashboard");
  };

  const features = [
    {
      icon: "school-outline",
      title: "University verified",
      description: "Exclusive to RUET, RU, BUET, SUST & IUT students",
      color: "#10b981",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Secure & private",
      description: "ID verification with bank‑grade encryption",
      color: "#10b981",
    },
    {
      icon: "people-outline",
      title: "Trusted network",
      description: "Connect with verified peers from your campus",
      color: "#10b981",
    },
    {
      icon: "cash-outline",
      title: "Earn Red Credits",
      description: "Get credits for listing items, use them for rentals",
      color: "#10b981",
    },
    {
      icon: "sparkles-outline",
      title: "AI‑powered search",
      description: "Find exactly what you need with natural language",
      color: "#10b981",
    },
  ];

  return (
    <View className="flex-1 bg-white px-6 justify-between pt-20 pb-12">
      {/* Brand */}
      <View className="items-center mt-10">
        <View className="items-center mb-6">
          <Image
            source={require("../assets/images/brittoo-logo.png")}
            style={{ width: 180, height: 70 }}
            resizeMode="contain"
          />
        </View>
        <Text className="text-gray-900 text-4xl font-semibold tracking-tight">
          Brittoo
        </Text>
        <Text className="text-emerald-600 text-sm mt-2 text-center leading-relaxed">
          The verified student community{"\n"}for Bangladesh universities
        </Text>
      </View>

      {/* Enriched feature list */}
      <View className="gap-3">
        {features.map((item) => (
          <View
            key={item.title}
            className="flex-row items-center gap-4 bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm"
            style={{ elevation: 1 }}
          >
            <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center">
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-sm">
                {item.title}
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5 leading-4">
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <View className="gap-3">
        <Button
          label="Create account"
          onPress={() => router.push("/(auth)/signup")}
          size="lg"
        />
        <Button
          label="Sign in"
          onPress={() => router.push("/(auth)/login")}
          variant="ghost"
          size="lg"
        />
      </View>
    </View>
  );
}
