// app/(app)/index.tsx

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  { name: "Instruments", icon: "musical-notes-outline" },
  { name: "Apparel", icon: "shirt-outline" },
  { name: "Books", icon: "book-outline" },
  { name: "Electronics", icon: "phone-portrait-outline" },
  { name: "Apartments", icon: "home-outline" },
  { name: "Furniture", icon: "bed-outline" },
];

const quickAccess = [
  {
    name: "Browsing\nProducts",
    icon: "bicycle-outline",
    onPress: () => router.push("/(auth)/login"),
  },
  {
    name: "Nearby\nPlaces",
    icon: "location",
    highlight: true,
    onPress: () => router.push("/(auth)/login"),
  },
  {
    name: "Ongoing\nNotices",
    icon: "reader-outline",
    onPress: () => router.push("/(auth)/login"),
  },
];

/**
 * Small wrapper that pops an icon (or any child) in with a spring
 * animation on mount, and gives it a gentle press-in/out bounce.
 * `delay` lets a row of icons stagger in one after another.
 */
function AnimatedIcon({
  children,
  delay = 0,
  onPress,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  onPress?: () => void;
  style?: any;
}) {
  const scale = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      delay,
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.88,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      <Animated.View
        style={{ transform: [{ scale: Animated.multiply(scale, pressScale) }] }}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-16"
      >
        {/* Header */}
        <View className="px-5 pt-2 pb-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={require("../assets/brittoofav.png")}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              resizeMode="contain"
            />
            <Text className="text-xl font-semibold text-gray-800 ml-2">
              Brittoo
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center relative"
              onPress={() => router.push("/(auth)/login")}
            >
              <Ionicons name="notifications-outline" size={18} color="#374151" />
              <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center relative"
              onPress={() => router.push("/(auth)/login")}
            >
              <Ionicons name="mail-outline" size={18} color="#374151" />
              <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero banner carousel */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(auth)/login")}
          >
            <LinearGradient
              colors={["#059669", "#10b981"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl overflow-hidden"
              style={{ height: 190 }}
            >
              <Image
                source={require("../assets/images/cover.png")}
                style={{
                  position: "absolute",
                  right: -10,
                  bottom: 0,
                  width: "62%",
                  height: "88%",
                  opacity: 0.95,
                }}
                resizeMode="contain"
              />
              <View className="p-5 flex-1 justify-center" style={{ width: "68%" }}>
                <Text className="text-2xl font-bold text-white leading-7">
                  Own Less,{"\n"}Access More
                </Text>
                <Text className="mt-2 text-emerald-50 text-xs leading-4">
                  Rent, barter, or share within your community — the smarter
                  way to own less.
                </Text>
                <TouchableOpacity
                  className="mt-4 self-start bg-white rounded-full px-4 py-2"
                  onPress={() => router.push("/(auth)/login")}
                >
                  <Text className="text-emerald-600 text-xs font-semibold">
                    Get It Now
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Dots */}
          <View className="flex-row justify-center mt-3 gap-1.5">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className={`h-1.5 rounded-full ${
                  i === activeSlide ? "w-4 bg-emerald-500" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Nearby Products Access */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-800">
              Nearby Products Access
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-xs font-medium text-emerald-600">
                View Cities  ›
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row mt-4 gap-3">
            {quickAccess.map((item, index) => (
              <AnimatedIcon
                key={item.name}
                delay={index * 90}
                onPress={item.onPress}
                style={{ flex: 1 }}
              >
                <View
                  className={`rounded-2xl py-4 items-center justify-center ${
                    item.highlight ? "bg-emerald-50" : "bg-gray-50"
                  }`}
                  style={{ minHeight: 108 }}
                >
                  <View
                    className={`w-11 h-11 rounded-full items-center justify-center ${
                      item.highlight ? "bg-emerald-500" : "bg-white"
                    }`}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.highlight ? "#fff" : "#059669"}
                    />
                  </View>
                  <Text className="mt-2 text-[11px] text-center text-gray-700 leading-4">
                    {item.name}
                  </Text>
                </View>
              </AnimatedIcon>
            ))}
          </View>
        </View>

        {/* Browse categories */}
        <View className="px-5 mt-8">
          <Text className="text-base font-semibold text-gray-800">
            Browse
          </Text>
          <View className="flex-row flex-wrap mt-4 -ml-3">
            {categories.map((c, index) => (
              <AnimatedIcon
                key={c.name}
                delay={index * 60}
                onPress={() => router.push("/(auth)/login")}
                style={{ width: "30%", marginLeft: "2.5%", marginBottom: 16 }}
              >
                <View className="items-center">
                  <View className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center">
                    <Ionicons name={c.icon as any} size={24} color="#059669" />
                  </View>
                  <Text className="mt-2 text-xs text-gray-700">{c.name}</Text>
                </View>
              </AnimatedIcon>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View className="px-5 mt-2 flex-row gap-4">
          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl p-4 flex-row items-center border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 2,
            }}
            onPress={() => router.push("/(auth)/login")}
          >
            <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
              <Ionicons name="search-outline" size={19} color="#059669" />
            </View>
            <View className="ml-3">
              <Text className="text-gray-800 font-semibold text-sm">
                Find items
              </Text>
              <Text className="text-gray-400 text-[11px] mt-0.5">
                Explore listings
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1"
            onPress={() => router.push("/(auth)/login")}
            style={{
              shadowColor: "#059669",
              shadowOpacity: 0.3,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={["#10b981", "#047857"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl p-4 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="add-circle-outline" size={19} color="#fff" />
              </View>
              <View className="ml-3">
                <Text className="text-white font-semibold text-sm">
                  List items
                </Text>
                <Text className="text-emerald-50 text-[11px] mt-0.5">
                  Start earning
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Nearby Products */}
        <View className="px-5 mt-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-800">
              Nearby Products
            </Text>
          </View>

          <TouchableOpacity
            className="mt-4 bg-gray-50 rounded-2xl p-6 items-center"
            onPress={() => router.push("/(auth)/login")}
          >
            <View className="w-14 h-14 rounded-full bg-emerald-50 items-center justify-center">
              <Ionicons name="lock-closed-outline" size={22} color="#059669" />
            </View>
            <Text className="mt-3 text-sm font-medium text-gray-800">
              Login to view nearby products
            </Text>
            <Text className="mt-1 text-xs text-gray-500 text-center">
              Sign in to see what's available around you
            </Text>
            <View className="mt-4 bg-emerald-500 rounded-full px-5 py-2">
              <Text className="text-white text-xs font-semibold">Login</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* How it works — teaser card only; full content lives on its own screen */}
        <View className="mx-5 mt-10 bg-gray-50 rounded-2xl p-5">
          <Text className="text-base font-medium text-gray-800">
            A smarter way to share
          </Text>
          <Text className="mt-2 text-sm text-gray-600 leading-4">
            Lend what you don’t use, earn credits, and withdraw anytime.
          </Text>
          <TouchableOpacity
            className="mt-4 self-start"
            onPress={() => router.push("/how-it-works")}
          >
            <Text className="text-emerald-600 text-sm font-medium">
              Learn more →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating mascot */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -10,
          bottom: 90,
          width: 110,
          height: 110,
        }}
      >
        <LottieView
          source={require("../assets/animations/green-robot.json")}
          autoPlay
          loop
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    </SafeAreaView>
  );
}