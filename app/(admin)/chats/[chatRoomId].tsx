import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    adminDeleteChatRoom,
    ChatMessage,
    ChatMessagesData,
    getChatMessages,
} from "../../../hooks/api";


function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminChatDetailScreen() {
  const { chatRoomId } = useLocalSearchParams<{ chatRoomId: string }>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatMessagesData["chatRoom"] | null>(null);
  const [pagination, setPagination] = useState<ChatMessagesData["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getChatMessages(chatRoomId, { page: 1, limit: 100 });
      setMessages(res.data.data.messages);
      setChatInfo(res.data.data.chatRoom);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error("Failed to load chat messages:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chatRoomId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleLoadMore = async () => {
    if (!pagination?.hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pagination.currentPage + 1;
      const res = await getChatMessages(chatRoomId, { page: nextPage, limit: 100 });
      setMessages((prev) => [...res.data.data.messages, ...prev]);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = () => {
    if (!chatInfo) return;
    Alert.alert(
      "Delete chat room?",
      `This deactivates the conversation between ${chatInfo.buyer.name} and ${chatInfo.seller.name}. This can't be undone from here.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await adminDeleteChatRoom(chatRoomId);
              router.back();
            } catch (err: any) {
              Alert.alert("Error", err?.response?.data?.message || "Failed to delete");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="small" color="#10b981" />
      </View>
    );
  }

  if (!chatInfo) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={40} color="#e5e7eb" />
        <Text className="text-gray-400 text-sm mt-3">Conversation not found</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-emerald-600 font-medium">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 px-5 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50"
          >
            <Ionicons name="trash-outline" size={13} color="#dc2626" />
            <Text className="text-red-600 text-xs font-medium">
              {deleting ? "Deleting..." : "Delete room"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-gray-900 text-lg font-semibold" numberOfLines={1}>
          {chatInfo.product.name}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-1.5">
          <Ionicons name="cart-outline" size={12} color="#10b981" />
          <Text className="text-gray-500 text-xs">
            Buyer: {chatInfo.buyer.name} · {chatInfo.buyer.email}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 mt-1">
          <Ionicons name="storefront-outline" size={12} color="#10b981" />
          <Text className="text-gray-500 text-xs">
            Seller: {chatInfo.seller.name} · {chatInfo.seller.email}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
        }
        ListHeaderComponent={
          pagination?.hasMore ? (
            <TouchableOpacity
              onPress={handleLoadMore}
              disabled={loadingMore}
              className="items-center py-2 mb-2"
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color="#10b981" />
              ) : (
                <Text className="text-emerald-600 text-xs font-medium">Load earlier messages</Text>
              )}
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item }) => {
          const isBuyer = item.senderId === chatInfo.buyerId;
          return (
            <View className={`mb-3 flex-row ${isBuyer ? "justify-start" : "justify-end"}`}>
              <View className={`max-w-[80%] ${isBuyer ? "items-start" : "items-end"}`}>
                <Text className="text-gray-400 text-[10px] mb-1 px-1">
                  {item.sender?.name ?? "Unknown"} · {isBuyer ? "Buyer" : "Seller"}
                </Text>
                <View
                  className={`rounded-2xl px-3.5 py-2.5 ${
                    isBuyer ? "bg-gray-100 rounded-bl-sm" : "bg-emerald-600 rounded-br-sm"
                  }`}
                >
                  <Text className={`text-sm ${isBuyer ? "text-gray-900" : "text-white"}`}>
                    {item.content}
                  </Text>
                  <Text
                    className={`text-[10px] mt-1 ${isBuyer ? "text-gray-400" : "text-emerald-100"}`}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="chatbubble-ellipses-outline" size={32} color="#d1d5db" />
            <Text className="text-gray-300 text-sm mt-3">No messages in this conversation</Text>
          </View>
        }
      />
    </View>
  );
}