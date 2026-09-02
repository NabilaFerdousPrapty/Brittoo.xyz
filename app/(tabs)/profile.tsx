
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
import { Button } from "../../components/button";
import { STORAGE_KEYS } from "../../constants";
import type { UserOverviewResponse } from "../../hooks/api";
import { getCurrentUser, getUserOverview } from "../../hooks/api";
import type { User } from "../../hooks/useAuth";

type DashboardOverview = UserOverviewResponse["data"];

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchUser(), fetchOverview()]);
    setLoading(false);
    setRefreshing(false);
  };

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
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await getUserOverview();
      if (res.data?.data) setOverview(res.data.data);
    } catch {
      // Non-fatal — profile still renders with account details even if
      // the dashboard stats call fails (e.g. offline).
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

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchAll();
          }}
          tintColor="#10b981"
        />
      }
    >
      <View className="bg-emerald-600 px-6 pt-14 pb-8">
        <View className="flex-row items-center gap-3">
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
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white/20 px-3 py-2 rounded-lg"
          >
            <Ionicons name="log-out-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 -mt-4">
        {/* Wallet balance */}
        {overview?.wallet && (
          <TouchableOpacity
            onPress={() => router.push("/wallet")}
            className="bg-white border border-gray-100 rounded-2xl p-4 mb-4"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                  <Ionicons name="wallet-outline" size={19} color="#059669" />
                </View>
                <View>
                  <Text className="text-gray-400 text-xs">
                    Available balance
                  </Text>
                  <Text className="text-gray-900 font-semibold text-base">
                    {overview.wallet.availableBalance} BCC
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </View>
            {overview.wallet.lockedBalance > 0 && (
              <Text className="text-gray-400 text-[11px] mt-2">
                {overview.wallet.lockedBalance} BCC locked in active rentals
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Rental / listing stats */}
        {overview?.stats && (
          <View className="flex-row flex-wrap gap-3 mb-4">
            {[
              {
                label: "Active rentals",
                value: overview.stats.activeRentals,
                icon: "swap-horizontal-outline",
                color: "#10b981",
              },
              {
                label: "Products listed",
                value: overview.stats.productsListed,
                icon: "cube-outline",
                color: "#7c3aed",
              },
              {
                label: "RCC credits",
                value: overview.stats.totalRccCredits,
                icon: "pricetag-outline",
                color: "#d97706",
              },
              {
                label: "Pending requests",
                value: overview.stats.pendingRequestsCount,
                icon: "time-outline",
                color: "#ef4444",
              },
            ].map((stat) => (
              <View
                key={stat.label}
                className="bg-white border border-gray-100 rounded-2xl p-4"
                style={{
                  width: "47%",
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
                  className="font-semibold text-base mt-0.5"
                >
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* My listings — reuses existing getProducts({ ownerId }), no new endpoint */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(products)/my-listings",
              params: { ownerId: user.id },
            })
          }
          activeOpacity={0.8}
          className="flex-row items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm"
        >
          {/* Left Section */}
          <View className="flex-row items-center flex-1">
            {/* Icon */}
            <View className="w-12 h-12 rounded-xl bg-emerald-50 items-center justify-center mr-4">
              <Ionicons name="list-outline" size={24} color="#059669" />
            </View>

            {/* Text */}
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">
                My Listings
              </Text>

              <Text className="text-sm text-gray-500 mt-1">
                Manage your listed products
              </Text>
            </View>
          </View>

          {/* Arrow */}
          <View className="w-9 h-9 rounded-full bg-gray-50 items-center justify-center">
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>

        {/* Pending requests */}
        {overview?.pendingRequests && overview.pendingRequests.length > 0 && (
          <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
              Pending requests
            </Text>
            {overview.pendingRequests.map((req, i, arr) => (
              <View
                key={req.id}
                className={`flex-row items-center justify-between py-2.5 ${i < arr.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <View className="flex-1 pr-2">
                  <Text className="text-gray-900 text-sm">
                    {req.productName}
                  </Text>
                  <Text className="text-gray-400 text-[11px] mt-0.5">
                    {req.type === "incoming"
                      ? `From ${req.requesterName} · ${req.time}`
                      : `${req.status} · ${req.time}`}
                  </Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full ${req.type === "incoming" ? "bg-amber-50" : "bg-blue-50"}`}
                >
                  <Text
                    className={`text-[10px] font-medium ${req.type === "incoming" ? "text-amber-700" : "text-blue-700"}`}
                  >
                    {req.type === "incoming" ? "Incoming" : "Outgoing"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent activity */}
        {overview?.recentActivity && overview.recentActivity.length > 0 && (
          <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
              Recent activity
            </Text>
            {overview.recentActivity.map((activity, i, arr) => (
              <View
                key={`${activity.title}-${i}`}
                className={`flex-row items-center gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <Ionicons
                  name={
                    activity.type === "transaction"
                      ? "card-outline"
                      : "swap-horizontal-outline"
                  }
                  size={15}
                  color="#9ca3af"
                />
                <View className="flex-1">
                  <Text className="text-gray-900 text-sm">
                    {activity.title}
                  </Text>
                  <Text className="text-gray-400 text-[11px] mt-0.5">
                    {activity.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

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

        {user.isVerified === "UNVERIFIED" && (
          <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
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

        <TouchableOpacity
          onPress={() => router.push("/wallet")}
          className="flex-row items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 mb-4"
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="receipt-outline" size={18} color="#059669" />
            <Text className="text-gray-800 font-medium text-sm">
              Full wallet & credit history
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}