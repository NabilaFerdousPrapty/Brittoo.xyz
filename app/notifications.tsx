import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getMyNotifications, markNotificationAsRead, UserNotification } from "../hooks/api";

// `data.url` on a notification is a WEB APP path (e.g.
// "/dashboard/received-purchase-requests"), set server-side by
// createNotification() calls scattered across the purchase/rental/chat
// controllers. This is a best-effort map to the mobile equivalents that
// actually exist right now — anything not listed here just does nothing
// instead of navigating somewhere broken. Extend this as more web routes
// get mobile screens.
function mapWebUrlToMobileRoute(url?: string): { pathname: string; params?: any } | null {
  if (!url) return null;
  const routes: Record<string, { pathname: string; params?: any }> = {
    "/dashboard/received-purchase-requests": {
      pathname: "/(products)/requests",
      params: { type: "purchase", tab: "received" },
    },
    "/dashboard/placed-purchase-requests": {
      pathname: "/(products)/requests",
      params: { type: "purchase", tab: "placed" },
    },
    "/dashboard/received-requests": {
      pathname: "/(products)/requests",
      params: { type: "rental", tab: "received" },
    },
    "/dashboard/placed-requests": {
      pathname: "/(products)/requests",
      params: { type: "rental", tab: "placed" },
    },
    "/dashboard/incoming-chats": { pathname: "/inbox" },
    "/dashboard/outgoing-chats": { pathname: "/inbox" },
  };
  return routes[url] ?? null;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res.data.data ?? []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handlePress = async (n: UserNotification) => {
    if (!n.isRead) {
      // Optimistic — flip locally, fire the request, don't block navigation on it
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
      );
      markNotificationAsRead(n.id).catch((err) =>
        console.error("Failed to mark notification read:", err),
      );
    }

    const target = mapWebUrlToMobileRoute(n.data?.url);
    if (target) {
      router.push(target as any);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 px-5 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-4 self-start">
          <Ionicons name="arrow-back" size={22} color="#10b981" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-2xl font-semibold">Notifications</Text>
        <Text className="text-gray-400 text-sm mt-1">
          {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
        }
      >
        {loading && !refreshing ? (
          <View className="items-center py-16">
            <ActivityIndicator size="small" color="#10b981" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="notifications-outline" size={36} color="#d1d5db" />
            <Text className="text-gray-300 text-sm mt-3">No notifications yet</Text>
          </View>
        ) : (
          notifications.map((n) => (
            <TouchableOpacity
              key={n.id}
              activeOpacity={0.7}
              onPress={() => handlePress(n)}
              className="flex-row items-start gap-3 px-5 py-3.5 border-b border-gray-50"
              style={{ backgroundColor: n.isRead ? "#fff" : "#f0fdf4" }}
            >
              <View
                className={`w-2 h-2 rounded-full mt-2 ${n.isRead ? "bg-transparent" : "bg-emerald-500"}`}
              />
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-sm flex-1 mr-2 ${n.isRead ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}
                    numberOfLines={1}
                  >
                    {n.title}
                  </Text>
                  <Text className="text-gray-400 text-[11px]">{timeAgo(n.createdAt)}</Text>
                </View>
                <Text
                  className={`text-xs mt-0.5 ${n.isRead ? "text-gray-400" : "text-gray-600"}`}
                  numberOfLines={2}
                >
                  {n.body}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}