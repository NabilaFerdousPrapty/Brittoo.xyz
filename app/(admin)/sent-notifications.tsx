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
import { adminGetSentNotifications, SentNotification } from "../../hooks/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function describeTargets(targets: string) {
  if (targets === "all") return { label: "All users", count: null as number | null };
  const list = targets.split(",").map((t) => t.trim()).filter(Boolean);
  return { label: `${list.length} recipient${list.length === 1 ? "" : "s"}`, count: list.length };
}

export default function SentNotificationsScreen() {
  const [notifications, setNotifications] = useState<SentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminGetSentNotifications();
      setNotifications(res.data.data ?? []);
    } catch (err) {
      console.error("Failed to load sent notifications:", err);
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

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 px-5 pb-4 border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mb-4 self-start">
            <Ionicons name="arrow-back" size={22} color="#10b981" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-2xl font-semibold">Sent Notifications</Text>
          <Text className="text-gray-400 text-sm mt-1">
            {notifications.length} notification{notifications.length === 1 ? "" : "s"} sent
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(admin)/send-notification")}
          className="bg-emerald-600 rounded-xl px-3 py-2 flex-row items-center gap-1.5"
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text className="text-white text-xs font-semibold">New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
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
            <Ionicons name="paper-plane-outline" size={36} color="#d1d5db" />
            <Text className="text-gray-300 text-sm mt-3">Nothing sent yet</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const targetInfo = describeTargets(n.targets);
            return (
              <View
                key={n.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
                style={{ elevation: 1 }}
              >
                <Text className="text-gray-900 text-sm font-semibold mb-1">{n.title}</Text>
                <Text className="text-gray-500 text-xs mb-3" numberOfLines={3}>
                  {n.body}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons
                      name={targetInfo.count === null ? "megaphone-outline" : "people-outline"}
                      size={12}
                      color="#10b981"
                    />
                    <Text className="text-emerald-700 text-[11px] font-medium">
                      {targetInfo.label}
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-[11px]">{formatDate(n.createdAt)}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}