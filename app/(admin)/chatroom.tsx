import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { adminDeleteChatRoom, adminGetAllChatRooms, ChatRoom } from "../../hooks/api";

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminChatRoomsScreen() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminGetAllChatRooms();
      setRooms(res.data.data ?? []);
    } catch (err) {
      console.error("Failed to load chat rooms:", err);
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

  const handleDelete = (room: ChatRoom) => {
    Alert.alert(
      "Delete chat room?",
      `This deactivates the conversation between ${room.buyer?.name} and ${room.seller?.name} about "${room.product?.name}". This can't be undone from here.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(room.id);
            try {
              await adminDeleteChatRoom(room.id);
              setRooms((prev) => prev.filter((r) => r.id !== room.id));
            } catch (err: any) {
              Alert.alert("Error", err?.response?.data?.message || "Failed to delete");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const filtered = rooms.filter((r) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      r.product?.name?.toLowerCase().includes(q) ||
      r.buyer?.name?.toLowerCase().includes(q) ||
      r.buyer?.email?.toLowerCase().includes(q) ||
      r.seller?.name?.toLowerCase().includes(q) ||
      r.seller?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 px-5 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-4 self-start">
          <Ionicons name="arrow-back" size={22} color="#10b981" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-2xl font-semibold">Manage Chats</Text>
        <Text className="text-gray-400 text-sm mt-1">
          {rooms.length} chat room{rooms.length === 1 ? "" : "s"} platform-wide
        </Text>
      </View>

      {/* Search */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
          <Ionicons name="search-outline" size={16} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search product, buyer, or seller"
            placeholderTextColor="#9ca3af"
            className="flex-1 text-sm text-gray-800"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
        }
      >
        {loading && !refreshing ? (
          <View className="items-center py-16">
            <ActivityIndicator size="small" color="#10b981" />
          </View>
        ) : filtered.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="chatbubbles-outline" size={36} color="#d1d5db" />
            <Text className="text-gray-300 text-sm mt-3">
              {search ? "No matching chat rooms" : "No chat rooms yet"}
            </Text>
          </View>
        ) : (
          filtered.map((room) => {
            const lastMessage = room.messages?.[0];
            const messageCount = room._count?.messages ?? 0;

            return (
              <TouchableOpacity
                key={room.id}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/(admin)/chats/[chatRoomId]",
                    params: { chatRoomId: room.id },
                  })
                }
                className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
                style={{ elevation: 1 }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-900 text-sm font-semibold flex-1 mr-2" numberOfLines={1}>
                    {room.product?.name ?? "Product"}
                  </Text>
                  <View className="bg-gray-100 rounded-full px-2 py-0.5">
                    <Text className="text-gray-500 text-[11px] font-medium">
                      {messageCount} msg{messageCount === 1 ? "" : "s"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-1.5 mb-1">
                  <Ionicons name="cart-outline" size={13} color="#10b981" />
                  <Text className="text-gray-600 text-xs flex-1" numberOfLines={1}>
                    Buyer: {room.buyer?.name} · {room.buyer?.email}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5 mb-2">
                  <Ionicons name="storefront-outline" size={13} color="#10b981" />
                  <Text className="text-gray-600 text-xs flex-1" numberOfLines={1}>
                    Seller: {room.seller?.name} · {room.seller?.email}
                  </Text>
                </View>

                {lastMessage ? (
                  <View className="bg-gray-50 rounded-xl px-3 py-2 mb-3">
                    <Text className="text-gray-500 text-xs" numberOfLines={2}>
                      <Text className="font-medium text-gray-700">
                        {lastMessage.sender?.name ?? "Someone"}:{" "}
                      </Text>
                      {lastMessage.content}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-gray-300 text-xs italic mb-3">No messages yet</Text>
                )}

                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-400 text-[11px]">
                    Started {timeAgo(room.createdAt)}
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(room);
                      }}
                      disabled={deletingId === room.id}
                      className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50"
                    >
                      <Ionicons name="trash-outline" size={13} color="#dc2626" />
                      <Text className="text-red-600 text-xs font-medium">
                        {deletingId === room.id ? "Deleting..." : "Delete"}
                      </Text>
                    </TouchableOpacity>
                    <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
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