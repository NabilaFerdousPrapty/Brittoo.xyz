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

  const isAdmin = user?.role === "ADMIN";

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <View className="items-center">
          <View className="w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center mb-4">
            <Text className="text-white font-bold text-xl">B</Text>
          </View>
          <Text className="text-gray-400 text-sm">Loading...</Text>
        </View>
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
      className="flex-1 bg-gray-50"
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
      {/* Header with Brittoo branding */}
      <View className="bg-emerald-600 px-6 pt-14 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 bg-white/20 rounded-lg items-center justify-center">
              <Text className="text-white font-bold text-lg">B</Text>
            </View>
            <Text className="text-white font-semibold text-lg tracking-tight">
              Brittoo
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white/20 px-3 py-2 rounded-lg"
          >
            <Ionicons name="log-out-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* User profile section */}
        <View className="flex-row items-center gap-3 mt-2">
          <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center">
            <Text className="text-emerald-600 font-bold text-lg">
              {initials}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-lg">
              {user.name}
            </Text>
            <Text className="text-emerald-100 text-xs mt-0.5">
              {user.email}
            </Text>
            {isAdmin && (
              <View className="flex-row items-center gap-1 mt-1">
                <Ionicons name="shield-checkmark" size={12} color="#fcd34d" />
                <Text className="text-emerald-100 text-[10px] font-medium">
                  Administrator
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="px-6 -mt-4">
        {/* Admin Dashboard Card - Only visible to admins */}
        {isAdmin && (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-emerald-100">
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

        {/* Quick nav to products */}
        <TouchableOpacity
          onPress={() => router.push("/(products)/")}
          className="flex-row items-center justify-between bg-emerald-600 rounded-2xl p-4 mb-4"
          activeOpacity={0.85}
          style={{
            elevation: 4,
            shadowColor: "#10b981",
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
          }}
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
  );
}
