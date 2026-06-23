import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { STORAGE_KEYS } from "../../constants";
import { adminGetAnalytics } from "../../hooks/api";
import { useAdminGuard } from "../../hooks/useAdminGuard";
import { useAuth } from "../../hooks/useAuth";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconName;
  color: string;
  bg: string;
  onPress?: () => void;
}

function StatCard({ label, value, icon, color, bg, onPress }: StatCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      className="flex-1 bg-white border border-gray-100 rounded-2xl p-4"
      style={{
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      }}
    >
      <View
        className={`w-9 h-9 rounded-xl items-center justify-center mb-3`}
        style={{ backgroundColor: bg }}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="text-gray-900 text-xl font-bold">{value}</Text>
      <Text className="text-gray-400 text-xs mt-0.5">{label}</Text>
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={12}
          color="#d1d5db"
          style={{ position: "absolute", top: 16, right: 16 }}
        />
      )}
    </TouchableOpacity>
  );
}

interface NavItemProps {
  label: string;
  desc: string;
  icon: IconName;
  badge?: number | string;
  onPress: () => void;
}

// ✅ NavItem as separate component - pass user as prop
function NavItem({
  label,
  desc,
  icon,
  badge,
  onPress,
  user,
}: NavItemProps & { user?: any }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center gap-4 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 mb-2.5"
      style={{
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.02,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      }}
    >
      <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
        <Ionicons name={icon} size={20} color="#374151" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 text-sm font-semibold">{label}</Text>
        <Text className="text-gray-400 text-xs mt-0.5">{desc}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {badge !== undefined && (
          <View className="bg-gray-900 rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
            <Text className="text-white text-[10px] font-bold">{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
      </View>
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen() {
  const { ready } = useAdminGuard();
  const { user, loading: authLoading } = useAuth(); // ✅ Hook called inside component
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    if (ready) {
      loadData();
      loadAdmin();
    }
  }, [ready]);

  const loadAdmin = async () => {
    const s = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    if (s) setAdminName(JSON.parse(s).name?.split(" ")[0] ?? "Admin");
  };

  const loadData = async () => {
    try {
      const res = await adminGetAnalytics();
      setAnalytics(res.data?.data ?? res.data);
    } catch (e) {
      console.error("Analytics error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    router.replace("/(auth)/login");
  };

  if (!ready) return null;

  const a = analytics ?? {};

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor="#111827"
          />
        }
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-100 pt-14 pb-4 px-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-400 text-xs">Admin Panel</Text>
              <Text className="text-gray-900 text-xl font-semibold">
                Hey, {adminName} 👋
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-2"
            >
              <Ionicons name="log-out-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-xs font-medium">
                Sign out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 pt-5">
          {/* Admin Banner - only visible to admins */}
          {user?.role === "ADMIN" && (
            <TouchableOpacity
              className="mb-5 bg-gray-900 rounded-2xl p-4 flex-row items-center justify-between"
              onPress={() => router.push("/(admin)")}
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-emerald-500 p-2 rounded-full">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color="white"
                  />
                </View>
                <View>
                  <Text className="text-white font-bold text-sm">
                    Admin Panel
                  </Text>
                  <Text className="text-gray-400 text-xs mt-0.5">
                    Manage users & platform
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#10b981" />
            </TouchableOpacity>
          )}

          {/* Analytics grid */}
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#111827" />
              <Text className="text-gray-400 text-xs mt-2">
                Loading analytics...
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                Platform Overview
              </Text>
              <View className="flex-row gap-3 mb-3">
                <StatCard
                  label="Total Users"
                  value={a.totalUsers ?? "—"}
                  icon="people-outline"
                  color="#2563eb"
                  bg="#eff6ff"
                  onPress={() => router.push("/(admin)/users")}
                />
                <StatCard
                  label="Verified"
                  value={a.verifiedUsers ?? "—"}
                  icon="checkmark-circle-outline"
                  color="#16a34a"
                  bg="#f0fdf4"
                />
              </View>
              <View className="flex-row gap-3 mb-3">
                <StatCard
                  label="Products"
                  value={a.totalProducts ?? "—"}
                  icon="cube-outline"
                  color="#7c3aed"
                  bg="#f5f3ff"
                  onPress={() => router.push("/(admin)/products")}
                />
                <StatCard
                  label="Active Rentals"
                  value={a.activeRentals ?? "—"}
                  icon="swap-horizontal-outline"
                  color="#d97706"
                  bg="#fffbeb"
                  onPress={() => router.push("/(admin)/rental-requests")}
                />
              </View>
              <View className="flex-row gap-3 mb-5">
                <StatCard
                  label="Pending Users"
                  value={a.pendingVerifications ?? "—"}
                  icon="time-outline"
                  color="#d97706"
                  bg="#fffbeb"
                  onPress={() => router.push("/(admin)/users")}
                />
                <StatCard
                  label="Suspended"
                  value={a.suspendedUsers ?? "—"}
                  icon="ban-outline"
                  color="#dc2626"
                  bg="#fef2f2"
                />
              </View>
            </>
          )}

          {/* Navigation */}
          <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
            Manage
          </Text>

          <NavItem
            label="Users"
            desc="Verify, suspend and inspect users"
            icon="people-outline"
            badge={a.pendingVerifications ?? undefined}
            onPress={() => router.push("/(admin)/users")}
          />
          <NavItem
            label="Rental Requests"
            desc="Update status, reject, and handle BCC/RCC refunds"
            icon="swap-horizontal-outline"
            onPress={() => router.push("/(admin)/rental-requests")}
          />
          <NavItem
            label="Purchase Requests"
            desc="Approve and manage product sale requests"
            icon="card-outline"
            onPress={() => router.push("/(admin)/purchase-requests")}
          />
          <NavItem
            label="Products"
            desc="Edit, hold, and admin-update listings"
            icon="cube-outline"
            onPress={() => router.push("/(admin)/products")}
          />

          {/* Back to app */}
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/")}
            className="flex-row items-center justify-center gap-2 mt-4 py-3"
          >
            <Ionicons name="arrow-back-outline" size={14} color="#9ca3af" />
            <Text className="text-gray-400 text-sm">Back to main app</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
