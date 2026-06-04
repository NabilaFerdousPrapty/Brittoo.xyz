import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../components/button";
import { STORAGE_KEYS } from "../constants";
import { getCurrentUser } from "../hooks/api";
import type { User } from "../hooks/useAuth";

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

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400 text-sm">Loading...</Text>
      </View>
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

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 40 }}
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
      <View className="px-6 pt-14 pb-5 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-400 text-sm">Welcome back 👋</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#10b981" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-emerald-600 rounded-xl items-center justify-center">
            <Text className="text-white font-semibold text-sm">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-lg font-semibold">
              {user.name}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">{user.email}</Text>
          </View>
        </View>
      </View>

      <View className="px-6 pt-5 gap-4">
        {/* Quick nav to products */}
        <TouchableOpacity
          onPress={() => router.push("/(products)/")}
          className="flex-row items-center justify-between bg-emerald-600 rounded-2xl p-4"
          activeOpacity={0.85}
        >
          <View>
            <Text className="text-white font-semibold text-sm">
              Browse Products
            </Text>
            <Text className="text-emerald-100 text-xs mt-0.5">
              Rent or buy from the community
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <View className={`${v.bg} border ${v.border} rounded-2xl p-4`}>
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

        <View className="flex-row gap-3">
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
              className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4"
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

        <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
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
            },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              className={`flex-row items-center gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <Ionicons name={item.icon as any} size={15} color="#9ca3af" />
              <View className="flex-1">
                <Text className="text-gray-400 text-xs">{item.label}</Text>
                <Text className="text-gray-900 text-sm mt-0.5">
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

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
  );
}
