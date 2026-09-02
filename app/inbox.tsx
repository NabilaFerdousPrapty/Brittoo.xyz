import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { STORAGE_KEYS } from "../constants";
import { ChatRoom, getMyChatRooms } from "../hooks/api";

// NOTE: tapping a room pushes to a per-room chat screen that doesn't exist
// yet. Build it next (getChatMessages for history + a socket.io-client
// connection using the join_room / send_message / typing events already
// implemented in chatSocket.js) if you want actual threaded messaging.

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function Avatar({ name, online }: { name: string; online?: boolean }) {
  const letter = name?.trim()?.[0]?.toUpperCase() || "?";
  return (
    <View className="relative">
      <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center">
        <Text className="text-emerald-700 text-base font-bold">{letter}</Text>
      </View>
      {online && (
        <View className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
      )}
    </View>
  );
}

export default function InboxScreen() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEYS.USER).then((s) => {
      if (s) setCurrentUserId(JSON.parse(s).id);
    });
    load();
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await getMyChatRooms();
      setRooms(res.data.data ?? []);
    } catch (err) {
      console.error("Failed to load chat rooms:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 px-5 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-4 self-start">
          <Ionicons name="arrow-back" size={22} color="#10b981" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-2xl font-semibold">Inbox</Text>
        <Text className="text-gray-400 text-sm mt-1">
          Conversations with buyers and sellers
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
        }
      >
        {loading && !refreshing ? (
          <View className="items-center py-16">
            <ActivityIndicator size="small" color="#10b981" />
          </View>
        ) : rooms.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="chatbubbles-outline" size={36} color="#d1d5db" />
            <Text className="text-gray-300 text-sm mt-3">No conversations yet</Text>
          </View>
        ) : (
          rooms.map((room) => {
            const isBuyer = room.buyerId === currentUserId;
            const partner = isBuyer ? room.seller : room.buyer;
            const lastMessage = room.messages?.[0];
            const unread = room.unreadCount ?? 0;

            return (
              <TouchableOpacity
                key={room.id}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/(products)/chat/[chatRoomId]",
                    params: { chatRoomId: room.id },
                  })
                }
                className="flex-row items-center gap-3 px-5 py-3 border-b border-gray-50"
              >
                <Avatar name={partner?.name ?? "?"} online={room.isPartnerOnline} />

                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-sm ${unread > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}
                      numberOfLines={1}
                    >
                      {partner?.name ?? "Unknown"}
                    </Text>
                    <Text className="text-gray-400 text-[11px]">
                      {timeAgo(lastMessage?.createdAt ?? room.updatedAt)}
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                    {room.product?.name}
                  </Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text
                      className={`text-xs flex-1 mr-2 ${unread > 0 ? "text-gray-800 font-medium" : "text-gray-400"}`}
                      numberOfLines={1}
                    >
                      {lastMessage
                        ? `${lastMessage.senderId === currentUserId ? "You: " : ""}${lastMessage.content}`
                        : "No messages yet"}
                    </Text>
                    {unread > 0 && (
                      <View className="bg-emerald-600 rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
                        <Text className="text-white text-[11px] font-bold">{unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}