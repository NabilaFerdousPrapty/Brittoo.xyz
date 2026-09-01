import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { io, Socket } from "socket.io-client";
import { STORAGE_KEYS } from "../../../constants";
import { BACKEND_URL, ChatMessage, ChatMessagesData, getChatMessages } from "../../../hooks/api";

// Mirrors the events implemented in chatSocket.js:
// - emit  join_room   { chatRoomId }
// - emit  send_message{ chatRoomId, content }
// - emit  typing      { chatRoomId, isTyping }
// - emit  leave_room  chatRoomId
// - on    new_message      -> ChatMessage (broadcast to everyone in the room, sender included)
// - on    messages_read    -> { chatRoomId }
// - on    partner_status   -> { isOnline }
// - on    user_typing      -> { userId, isTyping }
// - on    error             -> { message }

const TYPING_DEBOUNCE_MS = 350;
const TYPING_TIMEOUT_MS = 2500;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatRoomScreen() {
  const { chatRoomId } = useLocalSearchParams<{ chatRoomId: string }>();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatMessagesData["chatRoom"] | null>(null);
  const [pagination, setPagination] = useState<ChatMessagesData["pagination"] | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [connected, setConnected] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initial load: current user + message history (REST) ──────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      if (userStr && !cancelled) setCurrentUserId(JSON.parse(userStr).id);

      try {
        const res = await getChatMessages(chatRoomId, { page: 1, limit: 50 });
        if (cancelled) return;
        setMessages(res.data.data.messages);
        setChatInfo(res.data.data.chatRoom);
        setPagination(res.data.data.pagination);
        setPartnerOnline(res.data.data.chatRoom.isPartnerOnline);
      } catch (err) {
        console.error("Failed to load chat messages:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatRoomId]);

  // ── Socket connection ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      if (!token || cancelled) return;

      const socket = io(BACKEND_URL, {
        auth: { token },
        transports: ["websocket"],
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        socket.emit("join_room", { chatRoomId });
      });

      socket.on("disconnect", () => setConnected(false));

      socket.on("connect_error", (err) => {
        console.error("Chat socket connect error:", err.message);
      });

      socket.on("new_message", (message: ChatMessage) => {
        if (message.chatRoomId !== chatRoomId) return;
        setMessages((prev) => [...prev, message]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
      });

      socket.on("partner_status", ({ isOnline }: { isOnline: boolean }) => {
        setPartnerOnline(isOnline);
      });

      socket.on("user_typing", ({ isTyping }: { userId: string; isTyping: boolean }) => {
        setPartnerTyping(isTyping);
        if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
        if (isTyping) {
          partnerTypingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), TYPING_TIMEOUT_MS);
        }
      });

      socket.on("error", ({ message }: { message: string }) => {
        console.error("Chat socket error:", message);
      });
    })();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.emit("leave_room", chatRoomId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
    };
  }, [chatRoomId]);

  // ── Sending ────────────────────────────────────────────────────────
  const handleSend = () => {
    const content = inputText.trim();
    if (!content || !socketRef.current) return;
    setSending(true);
    socketRef.current.emit("send_message", { chatRoomId, content });
    setInputText("");
    stopTyping();
    // No optimistic append — the server echoes the saved message back via
    // "new_message" to everyone in the room, sender included.
    setTimeout(() => setSending(false), 300);
  };

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socketRef.current?.emit("typing", { chatRoomId, isTyping: false });
  }, [chatRoomId]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!socketRef.current) return;
    socketRef.current.emit("typing", { chatRoomId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, TYPING_DEBOUNCE_MS + 1000);
  };

  // ── Load older messages ────────────────────────────────────────────
  const handleLoadMore = async () => {
    if (!pagination?.hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pagination.currentPage + 1;
      const res = await getChatMessages(chatRoomId, { page: nextPage, limit: 50 });
      setMessages((prev) => [...res.data.data.messages, ...prev]);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setLoadingMore(false);
    }
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

  const isBuyer = chatInfo.buyerId === currentUserId;
  const partner = isBuyer ? chatInfo.seller : chatInfo.buyer;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View className="pt-14 px-4 pb-3 border-b border-gray-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#10b981" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center"
          onPress={() =>
            router.push({ pathname: "/(products)/[id]", params: { id: chatInfo.product.id } })
          }
        >
          <Text className="text-emerald-700 text-sm font-bold">
            {partner.name?.trim()?.[0]?.toUpperCase() || "?"}
          </Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
            {partner.name}
          </Text>
          <Text className="text-gray-400 text-xs" numberOfLines={1}>
            {partnerTyping ? (
              <Text className="text-emerald-600">typing…</Text>
            ) : partnerOnline ? (
              "Online"
            ) : (
              chatInfo.product.name
            )}
          </Text>
        </View>
        {!connected && (
          <View className="bg-amber-50 rounded-full px-2 py-1">
            <Text className="text-amber-600 text-[10px] font-medium">Reconnecting…</Text>
          </View>
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => {
          if (messages.length <= 50) flatListRef.current?.scrollToEnd({ animated: false });
        }}
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
          const isMe = item.senderId === currentUserId;
          return (
            <View className={`mb-2.5 flex-row ${isMe ? "justify-end" : "justify-start"}`}>
              <View
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                  isMe ? "bg-emerald-600 rounded-br-sm" : "bg-gray-100 rounded-bl-sm"
                }`}
              >
                <Text className={`text-sm ${isMe ? "text-white" : "text-gray-900"}`}>
                  {item.content}
                </Text>
                <Text
                  className={`text-[10px] mt-1 ${isMe ? "text-emerald-100" : "text-gray-400"}`}
                >
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="chatbubble-ellipses-outline" size={32} color="#d1d5db" />
            <Text className="text-gray-300 text-sm mt-3">Say hello 👋</Text>
          </View>
        }
      />

      {/* Input */}
      <View className="flex-row items-end gap-2 px-4 py-3 border-t border-gray-100">
        <TextInput
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Message..."
          placeholderTextColor="#9ca3af"
          multiline
          className="flex-1 max-h-24 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            inputText.trim() ? "bg-emerald-600" : "bg-gray-200"
          }`}
        >
          <Ionicons name="send" size={16} color={inputText.trim() ? "#fff" : "#9ca3af"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}