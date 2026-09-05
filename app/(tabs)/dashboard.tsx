import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/button";
import { STORAGE_KEYS } from "../../constants";
import { getCurrentUser } from "../../hooks/api";
import type { User } from "../../hooks/useAuth";

// ASSUMPTION: this file sits two folders under app/ (matching its
// "../../components", "../../hooks" imports), and assets/ lives under
// app/ alongside components/ and hooks/ (matching doc 48's "../assets"
// resolving to app/assets from one folder deep). That makes the correct
// depth here "../../assets/...". Verify these three requires resolve —
// if assets/ actually lives at the project root instead, these need to
// go up one more level ("../../../assets/...").
const brittoofav = require("../../assets/brittoofav.png");
const coverImage = require("../../assets/images/cover.png");
const greenRobotAnim = require("../../assets/animations/green-robot.json");

const vConfig = {
  UNVERIFIED: {
    label: "Not verified",
    color: "#ef4444",
    bg: "bg-red-50",
    border: "border-red-100",
    icon: "close-circle-outline" as const,
  },
  PENDING: {
    label: "Under review",
    color: "#d97706",
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: "time-outline" as const,
  },
  VERIFIED: {
    label: "Verified",
    color: "#16a34a",
    bg: "bg-green-50",
    border: "border-green-100",
    icon: "checkmark-circle-outline" as const,
  },
};

const categories = [
  { name: "Instruments", icon: "musical-notes-outline", productType: "MUSICAL_INSTRUMENT" },
  { name: "Apparel", icon: "shirt-outline", productType: "CLOTHING" },
  { name: "Books", icon: "book-outline", productType: "BOOK" },
  { name: "Electronics", icon: "phone-portrait-outline", productType: "ELECTRONICS" },
  { name: "Apartments", icon: "home-outline", productType: "APARTMENTS" },
  { name: "Furniture", icon: "bed-outline", productType: "FURNITURE" },
];

// Admin quick action card
function AdminQuickAction({
  icon,
  label,
  desc,
  color = "#10b981",
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  desc: string;
  color?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-1 bg-white border border-gray-100 rounded-xl p-3"
      style={{
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View className="items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: `${color}15` }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text className="text-gray-900 text-xs font-semibold text-center">
          {label}
        </Text>
        <Text className="text-gray-400 text-[10px] text-center mt-0.5">
          {desc}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

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

// Placeholder for sections that don't have a real destination yet.
function notImplemented(feature: string) {
  Alert.alert("Coming soon", `${feature} isn't available yet.`);
}

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSlide] = useState(0);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      if (res.data?.data) {
        setUser(res.data.data);
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER,
          JSON.stringify(res.data.data),
        );
      }
    } catch {
      const stored = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      if (stored) setUser(JSON.parse(stored));
      else router.replace("/(auth)/login");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
          router.replace("/");
        },
      },
    ]);
  };

  // Android hardware/gesture back button on this screen prompts the same
  // sign-out confirmation instead of navigating away. Returning `true`
  // tells BackHandler the press was handled, so it doesn't also perform
  // its default action (which would otherwise exit the app or pop the
  // stack, depending on what's behind this screen).
  useEffect(() => {
    const onBackPress = () => {
      handleLogout();
      return true;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );
    return () => subscription.remove();
  }, []);

  const isAdmin = user?.role === "ADMIN";

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <View className="items-center">
          <View className="w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center mb-4">
            <Text className="text-white font-bold text-xl">B</Text>
          </View>
          <Text className="text-gray-400 text-sm">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!user) return null;

  const v = vConfig[user.isVerified] ?? vConfig.UNVERIFIED;
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const quickAccess = [
    {
      name: "Browsing\nProducts",
      icon: "bicycle-outline" as const,
      onPress: () => router.push("/listing"),
    },
    {
      name: "Nearby\nPlaces",
      icon: "location" as const,
      highlight: true,
      onPress: () => notImplemented("Nearby places"),
    },
    {
      name: "Ongoing\nNotices",
      icon: "reader-outline" as const,
      onPress: () => notImplemented("Ongoing notices"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-16"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchUser();
            }}
            tintColor="#10b981"
          />
        }
      >
        {/* Header */}
        <View className="px-5 pt-2 pb-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={brittoofav}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              resizeMode="contain"
            />
            <Text className="text-xl font-semibold text-gray-800 ml-2">
              Brittoo
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
              onPress={() => router.push("/notifications")}
            >
              <Ionicons name="notifications-outline" size={18} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
              onPress={() => router.push("/inbox")}
            >
              <Ionicons name="mail-outline" size={18} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personalized profile row */}
        <View className="px-5 pt-3 pb-1 flex-row items-center gap-3">
          <View className="w-12 h-12 bg-emerald-600 rounded-2xl items-center justify-center">
            <Text className="text-white font-bold text-base">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-base">
              {user.name}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">{user.email}</Text>
            {isAdmin && (
              <View className="flex-row items-center gap-1 mt-1">
                <Ionicons name="shield-checkmark" size={12} color="#d97706" />
                <Text className="text-amber-600 text-[10px] font-medium">
                  Administrator
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Hero banner carousel */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/listing")}
          >
            <LinearGradient
              colors={["#059669", "#10b981"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl overflow-hidden"
              style={{ height: 190 }}
            >
              <Image
                source={coverImage}
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
                  onPress={() => router.push("/listing")}
                >
                  <Text className="text-emerald-600 text-xs font-semibold">
                    Browse Now
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

        <View className="px-5">
          {/* Admin Dashboard Card - Only visible to admins */}
          {isAdmin && (
            <View className="bg-white rounded-2xl p-4 mt-6 mb-2 border border-emerald-100">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 bg-emerald-100 rounded-lg items-center justify-center">
                    <Ionicons name="shield-checkmark" size={18} color="#10b981" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-semibold text-sm">
                      Admin Dashboard
                    </Text>
                    <Text className="text-gray-400 text-[10px]">
                      Manage your platform
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/(admin)")}
                  className="bg-emerald-600 px-3 py-1.5 rounded-lg"
                >
                  <Text className="text-white text-xs font-medium">
                    Go to Panel
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-2">
                <AdminQuickAction
                  icon="people-outline"
                  label="Users"
                  desc="Manage users"
                  onPress={() => router.push("/(admin)/users")}
                />
                <AdminQuickAction
                  icon="cube-outline"
                  label="Products"
                  desc="Manage listings"
                  onPress={() => router.push("/(admin)/products")}
                />
                <AdminQuickAction
                  icon="swap-horizontal-outline"
                  label="Rentals"
                  desc="Track requests"
                  color="#d97706"
                  onPress={() => router.push("/(admin)/rental-requests")}
                />
                <AdminQuickAction
                  icon="analytics-outline"
                  label="Analytics"
                  desc="View stats"
                  color="#7c3aed"
                  onPress={() => router.push("/(admin)")}
                />
              </View>
            </View>
          )}

          {/* Wallet */}
          <TouchableOpacity
            onPress={() => router.push("/wallet")}
            className="flex-row items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 self-start mt-4"
          >
            <Ionicons name="wallet-outline" size={16} color="#2563eb" />
            <Text className="text-blue-700 text-xs font-semibold">Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Products Access */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-800">
              Nearby Products Access
            </Text>
            <TouchableOpacity onPress={() => notImplemented("City selection")}>
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
                onPress={() =>
                  router.push({
                    pathname: "/listing",
                    params: { productType: c.productType },
                  } as any)
                }
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
            onPress={() => router.push("/listing")}
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
            onPress={() => router.push("/create")}
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

        <View className="px-5 mt-8">
          {/* Verification status */}
          <View className={`${v.bg} border ${v.border} rounded-2xl p-4 mb-4`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name={v.icon} size={18} color={v.color} />
                <View>
                  <Text className="text-gray-400 text-xs">
                    Identity verification
                  </Text>
                  <Text
                    style={{ color: v.color }}
                    className="font-semibold text-sm"
                  >
                    {v.label}
                  </Text>
                </View>
              </View>
              {user.isVerified === "UNVERIFIED" && (
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/verify-identity")}
                  className="bg-emerald-600 rounded-lg px-3 py-1.5"
                >
                  <Text className="text-white text-xs font-medium">
                    Verify now
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {user.isVerified === "PENDING" && (
              <Text className="text-gray-400 text-xs mt-2">
                Your documents are being reviewed. Usually 24-48 hours.
              </Text>
            )}
          </View>

          {/* Quick stats */}
          <View className="flex-row gap-3 mb-4">
            {[
              {
                label: "Security score",
                value: `${user.securityScore ?? 0}%`,
                icon: "shield-half-outline",
                color: "#10b981",
              },
              {
                label: "Email",
                value: user.emailVerified ? "Verified" : "Pending",
                icon: "mail-outline",
                color: user.emailVerified ? "#16a34a" : "#d97706",
              },
            ].map((stat) => (
              <View
                key={stat.label}
                className="flex-1 bg-white border border-gray-100 rounded-2xl p-4"
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                <Text className="text-gray-400 text-xs mt-2">{stat.label}</Text>
                <Text
                  style={{ color: stat.color }}
                  className="font-semibold text-sm mt-0.5"
                >
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Account details */}
          <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
              Account details
            </Text>
            {[
              {
                label: "Roll / Username",
                value: user.roll,
                icon: "person-outline",
              },
              { label: "Role", value: user.role, icon: "ribbon-outline" },
              {
                label: "University email",
                value: user.isValidRuetMail
                  ? "Valid university email"
                  : "External email",
                icon: "school-outline",
              },
              {
                label: "Status",
                value: user.isSuspended ? "Suspended" : "Active",
                icon: "checkmark-circle-outline",
                color: user.isSuspended ? "#ef4444" : "#16a34a",
              },
            ].map((item, i, arr) => (
              <View
                key={item.label}
                className={`flex-row items-center gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <Ionicons name={item.icon as any} size={15} color="#9ca3af" />
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">{item.label}</Text>
                  <Text
                    className="text-gray-900 text-sm mt-0.5"
                    style={item.color ? { color: item.color } : {}}
                  >
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Verification prompt for unverified users */}
          {user.isVerified === "UNVERIFIED" && (
            <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <Text className="text-gray-900 font-medium text-sm mb-1">
                Complete your profile
              </Text>
              <Text className="text-gray-400 text-xs mb-4 leading-5">
                Upload your student ID and selfie to unlock full access to
                Brittoo.
              </Text>
              <Button
                label="Start verification"
                onPress={() => router.push("/(auth)/verify-identity")}
                size="sm"
              />
            </View>
          )}
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
          source={greenRobotAnim}
          autoPlay
          loop
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    </SafeAreaView>
  );
}