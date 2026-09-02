
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io, Socket } from "socket.io-client";

import { STORAGE_KEYS } from "../../../constants";
import {
  BACKEND_URL,
  ChatMessage,
  ChatRoom,
  getChatMessages,
} from "../../../hooks/api";

/* ============================================================
   TYPES
============================================================ */

type SocketMessage = ChatMessage;

type TypingPayload = {
  userId: string;
  isTyping: boolean;
};

type PartnerStatusPayload = {
  isOnline: boolean;
};

type SocketErrorPayload = {
  message: string;
};

/* ============================================================
   HELPERS
============================================================ */

function formatTime(iso?: string) {
  if (!iso) return "";

  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function getInitials(name?: string) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

/* ============================================================
   AVATAR
============================================================ */

function Avatar({
  name,
  online,
  size = 44,
}: {
  name?: string;
  online?: boolean;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          {
            fontSize: size * 0.36,
          },
        ]}
      >
        {getInitials(name)}
      </Text>

      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: Math.max(10, size * 0.23),
              height: Math.max(10, size * 0.23),
              borderRadius: Math.max(5, size * 0.115),
            },
          ]}
        />
      )}
    </View>
  );
}

/* ============================================================
   MAIN SCREEN
============================================================ */

export default function ChatRoomScreen() {
  const { chatRoomId } = useLocalSearchParams<{
    chatRoomId?: string;
  }>();

  const roomId =
    typeof chatRoomId === "string"
      ? chatRoomId
      : Array.isArray(chatRoomId)
        ? chatRoomId[0]
        : undefined;

  /* ============================================================
     STATE
  ============================================================ */

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [chatInfo, setChatInfo] =
    useState<ChatRoom | null>(null);

  const [inputText, setInputText] = useState("");

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [connected, setConnected] = useState(false);

  const [partnerOnline, setPartnerOnline] =
    useState(false);

  const [partnerTyping, setPartnerTyping] =
    useState(false);

  /* ============================================================
     REFS
  ============================================================ */

  const socketRef = useRef<Socket | null>(null);

  const flatListRef =
    useRef<FlatList<ChatMessage>>(null);

  const typingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const mountedRef = useRef(true);

  /* ============================================================
     CURRENT USER
  ============================================================ */

  useEffect(() => {
    mountedRef.current = true;

    const loadCurrentUser = async () => {
      try {
        const storedUser =
          await SecureStore.getItemAsync(
            STORAGE_KEYS.USER
          );

        if (!storedUser) {
          console.warn("⚠️ No current user found");
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        console.log(
          "👤 Current user:",
          parsedUser?.id
        );

        if (parsedUser?.id) {
          setCurrentUserId(parsedUser.id);
        }
      } catch (error) {
        console.error(
          "❌ Failed to load current user:",
          error
        );
      }
    };

    loadCurrentUser();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ============================================================
     LOAD CHAT HISTORY
  ============================================================ */

  const loadMessages = useCallback(async () => {
    if (!roomId) {
      console.warn(
        "⚠️ Cannot load messages: chatRoomId missing"
      );
      return;
    }

    try {
      console.log(
        "📥 Loading chat messages:",
        roomId
      );

      setLoading(true);

      const res = await getChatMessages(roomId, {
        page: 1,
        limit: 50,
      });

      console.log(
        "✅ Chat messages loaded:",
        res.data.data?.messages?.length ?? 0
      );

      if (!mountedRef.current) return;

      const data = res.data.data;

      setMessages(data?.messages ?? []);

      setChatInfo(data?.chatRoom ?? null);

      setPartnerOnline(
        Boolean(data?.chatRoom?.isPartnerOnline)
      );

      setLoading(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({
          animated: false,
        });
      }, 100);
    } catch (error: any) {
      console.error(
        "❌ Failed to load chat messages:",
        error?.response?.data || error
      );

      if (!mountedRef.current) return;

      setLoading(false);

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Failed to load chat messages"
      );
    }
  }, [roomId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  /* ============================================================
     SOCKET.IO
     
     IMPORTANT:
     This effect intentionally depends ONLY on roomId.
     
     Do NOT add currentUserId here.
     Otherwise SecureStore loading can cause the socket
     to disconnect/reconnect unnecessarily.
  ============================================================ */

  useEffect(() => {
    if (!roomId) {
      console.warn(
        "⚠️ Socket not started: chatRoomId missing"
      );
      return;
    }

    let cancelled = false;

    const connectSocket = async () => {
      try {
        console.log(
          "🔌 Starting socket connection..."
        );

        const token =
          await SecureStore.getItemAsync(
            STORAGE_KEYS.TOKEN
          );

        if (!token) {
          console.error(
            "❌ Socket cannot connect: auth token missing"
          );
          return;
        }

        if (cancelled) return;

        console.log("🌐 Socket URL:", BACKEND_URL);
        console.log("🏠 Chat room:", roomId);

        const socket = io(BACKEND_URL, {
          auth: {
            token,
          },

          /*
           * websocket first, polling fallback.
           * This is important on some Android/Expo networks.
           */
          transports: ["websocket", "polling"],

          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,

          timeout: 15000,

          forceNew: true,
        });

        socketRef.current = socket;

        /* ======================================================
           CONNECT
        ====================================================== */

        socket.on("connect", () => {
          console.log(
            "✅ Socket connected:",
            socket.id
          );

          if (!mountedRef.current) return;

          setConnected(true);

          console.log(
            "📥 Joining chat room:",
            roomId
          );

          socket.emit("join_room", {
            chatRoomId: roomId,
          });
        });

        /* ======================================================
           DISCONNECT
        ====================================================== */

        socket.on("disconnect", (reason) => {
          console.log(
            "❌ Socket disconnected:",
            reason
          );

          if (!mountedRef.current) return;

          setConnected(false);
        });

        /* ======================================================
           CONNECT ERROR
        ====================================================== */

        socket.on(
          "connect_error",
          (error) => {
            console.error(
              "❌ Socket connection error:",
              error?.message || error
            );

            if (!mountedRef.current) return;

            setConnected(false);
          }
        );

        /* ======================================================
           NEW MESSAGE
        ====================================================== */

        socket.on(
          "new_message",
          (message: SocketMessage) => {
            console.log(
              "📨 New message received:",
              message
            );

            if (!message) return;

            if (
              message.chatRoomId !== roomId
            ) {
              console.warn(
                "⚠️ Ignoring message from another room"
              );
              return;
            }

            setMessages((previous) => {
              /*
               * Prevent duplicate messages.
               */
              const alreadyExists =
                previous.some(
                  (item) =>
                    item.id === message.id
                );

              if (alreadyExists) {
                return previous;
              }

              return [...previous, message];
            });

            setTimeout(() => {
              flatListRef.current?.scrollToEnd({
                animated: true,
              });
            }, 100);
          }
        );

        /* ======================================================
           PARTNER ONLINE STATUS
        ====================================================== */

        socket.on(
          "partner_status",
          (payload: PartnerStatusPayload) => {
            console.log(
              "🟢 Partner status:",
              payload
            );

            if (!mountedRef.current) return;

            setPartnerOnline(
              Boolean(payload?.isOnline)
            );
          }
        );

        /* ======================================================
           PARTNER TYPING
        ====================================================== */

        socket.on(
          "user_typing",
          (payload: TypingPayload) => {
            console.log(
              "⌨️ User typing:",
              payload
            );

            if (!mountedRef.current) return;

            /*
             * Ignore our own typing event.
             */
            if (
              payload?.userId === currentUserId
            ) {
              return;
            }

            setPartnerTyping(
              Boolean(payload?.isTyping)
            );
          }
        );

        /* ======================================================
           MESSAGES READ
        ====================================================== */

        socket.on(
          "messages_read",
          () => {
            console.log(
              "👀 Messages marked as read"
            );

            setMessages((previous) =>
              previous.map((message) => ({
                ...message,
                isRead: true,
              }))
            );
          }
        );

        /* ======================================================
           SOCKET ERROR
        ====================================================== */

        socket.on(
          "error",
          (payload: SocketErrorPayload) => {
            console.error(
              "❌ Chat socket error:",
              payload?.message || payload
            );
          }
        );
      } catch (error) {
        console.error(
          "❌ Failed to initialize socket:",
          error
        );
      }
    };

    connectSocket();

    /* ==========================================================
       CLEANUP
    ========================================================== */

    return () => {
      cancelled = true;

      console.log(
        "🧹 Cleaning up chat socket..."
      );

      if (typingTimeoutRef.current) {
        clearTimeout(
          typingTimeoutRef.current
        );
        typingTimeoutRef.current = null;
      }

      const socket = socketRef.current;

      if (socket) {
        if (socket.connected) {
          console.log(
            "📤 Leaving chat room:",
            roomId
          );

          socket.emit("leave_room", {
            chatRoomId: roomId,
          });
        }

        socket.removeAllListeners();
        socket.disconnect();

        socketRef.current = null;
      }

      setConnected(false);
      setPartnerTyping(false);
    };
  }, [roomId]);

  /* ============================================================
     TYPING
  ============================================================ */

  const stopTyping = useCallback(() => {
    const socket = socketRef.current;

    if (!socket || !socket.connected || !roomId) {
      return;
    }

    socket.emit("typing", {
      chatRoomId: roomId,
      isTyping: false,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current
      );

      typingTimeoutRef.current = null;
    }
  }, [roomId]);

  const handleInputChange = (
    text: string
  ) => {
    setInputText(text);

    const socket = socketRef.current;

    if (!socket || !socket.connected || !roomId) {
      return;
    }

    socket.emit("typing", {
      chatRoomId: roomId,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    typingTimeoutRef.current =
      setTimeout(() => {
        if (
          socketRef.current?.connected
        ) {
          socketRef.current.emit(
            "typing",
            {
              chatRoomId: roomId,
              isTyping: false,
            }
          );
        }
      }, 1500);
  };

  /* ============================================================
     SEND MESSAGE
  ============================================================ */

  const handleSend = () => {
    const content = inputText.trim();

    const socket = socketRef.current;

    console.log("📤 Attempting to send:", {
      chatRoomId: roomId,
      content,
      socketExists: Boolean(socket),
      socketConnected: socket?.connected,
    });

    if (!content) {
      return;
    }

    if (!roomId) {
      Alert.alert(
        "Error",
        "Chat room ID is missing."
      );
      return;
    }

    if (!socket) {
      Alert.alert(
        "Connection Error",
        "Chat connection is not ready yet."
      );
      return;
    }

    if (!socket.connected) {
      Alert.alert(
        "Connection Error",
        "Chat is not connected. Please wait a moment and try again."
      );

      console.warn(
        "⚠️ Cannot send: socket is not connected"
      );

      return;
    }

    if (sending) {
      return;
    }

    try {
      setSending(true);

      console.log("📤 Sending message:", {
        chatRoomId: roomId,
        content,
      });

      socket.emit("send_message", {
        chatRoomId: roomId,
        content,
      });

      setInputText("");

      stopTyping();

      /*
       * Do not wait forever if backend doesn't send an
       * acknowledgement. The actual message will arrive
       * through "new_message".
       */
      setTimeout(() => {
        if (mountedRef.current) {
          setSending(false);
        }
      }, 1000);
    } catch (error) {
      console.error(
        "❌ Failed to send message:",
        error
      );

      setSending(false);
    }
  };

  /* ============================================================
     MARK READ
  ============================================================ */

  const markMessagesAsRead = useCallback(() => {
    const socket = socketRef.current;

    if (
      !socket ||
      !socket.connected ||
      !roomId
    ) {
      return;
    }

    console.log(
      "👀 Marking messages as read:",
      roomId
    );

    /*
     * If your backend uses this event, it will mark
     * incoming messages as read.
     */
    socket.emit("messages_read", {
      chatRoomId: roomId,
    });
  }, [roomId]);

  useEffect(() => {
    if (
      connected &&
      messages.length > 0
    ) {
      markMessagesAsRead();
    }
  }, [
    connected,
    messages.length,
    markMessagesAsRead,
  ]);

  /* ============================================================
     PARTNER
  ============================================================ */

  const isBuyer =
    Boolean(
      chatInfo &&
        currentUserId &&
        chatInfo.buyerId === currentUserId
    );

  const partner =
    chatInfo && isBuyer
      ? chatInfo.seller
      : chatInfo?.buyer;

  /* ============================================================
     RENDER MESSAGE
  ============================================================ */

  const renderMessage = ({
    item,
  }: {
    item: ChatMessage;
  }) => {
    const isMine =
      item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageRow,
          isMine
            ? styles.myMessageRow
            : styles.partnerMessageRow,
        ]}
      >
        {!isMine && (
          <Avatar
            name={item.sender?.name}
            size={32}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isMine
              ? styles.myBubble
              : styles.partnerBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine
                ? styles.myMessageText
                : styles.partnerMessageText,
            ]}
          >
            {item.content}
          </Text>

          <View style={styles.messageMeta}>
            <Text
              style={[
                styles.messageTime,
                isMine
                  ? styles.myMessageTime
                  : styles.partnerMessageTime,
              ]}
            >
              {formatTime(item.createdAt)}
            </Text>

            {isMine && (
              <Ionicons
                name={
                  item.isRead
                    ? "checkmark-done"
                    : "checkmark"
                }
                size={15}
                color={
                  item.isRead
                    ? "#D1FAE5"
                    : "#E5E7EB"
                }
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#10B981"
        />

        <Text style={styles.loadingText}>
          Loading chat...
        </Text>
      </View>
    );
  }

  /* ============================================================
     MAIN UI
  ============================================================ */

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS === "ios" ? 0 : 0
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerPartner}
          activeOpacity={0.7}
          onPress={() => {
            if (
              chatInfo?.product?.id
            ) {
              router.push({
                pathname:
                  "/(products)/[id]",
                params: {
                  id: chatInfo.product.id,
                },
              });
            }
          }}
        >
          <Avatar
            name={partner?.name}
            online={partnerOnline}
            size={42}
          />

          <View style={styles.headerTextContainer}>
            <Text
              style={styles.partnerName}
              numberOfLines={1}
            >
              {partner?.name ||
                "Chat Partner"}
            </Text>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      partnerOnline
                        ? "#10B981"
                        : "#9CA3AF",
                  },
                ]}
              />

              <Text
                style={styles.statusText}
              >
                {partnerTyping
                  ? "typing..."
                  : partnerOnline
                    ? "Online"
                    : "Offline"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Connection indicator */}

        <View style={styles.connectionContainer}>
          <View
            style={[
              styles.connectionDot,
              {
                backgroundColor:
                  connected
                    ? "#10B981"
                    : "#EF4444",
              },
            ]}
          />

          <Text
            style={styles.connectionText}
          >
            {connected
              ? "Connected"
              : "Connecting..."}
          </Text>
        </View>
      </View>

      {/* ======================================================
          PRODUCT BAR
      ====================================================== */}

      {chatInfo?.product && (
        <TouchableOpacity
          style={styles.productBar}
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname:
                "/(products)/[id]",
              params: {
                id: chatInfo.product.id,
              },
            });
          }}
        >
          <View style={styles.productIcon}>
            <Ionicons
              name="cube-outline"
              size={22}
              color="#059669"
            />
          </View>

          <View style={styles.productInfo}>
            <Text
              style={styles.productName}
              numberOfLines={1}
            >
              {chatInfo.product.name}
            </Text>

            {chatInfo.product.askingPrice !=
              null && (
              <Text
                style={styles.productPrice}
              >
                ৳
                {Number(
                  chatInfo.product
                    .askingPrice
                ).toLocaleString()}
              </Text>
            )}
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      )}

      {/* ======================================================
          MESSAGES
      ====================================================== */}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) =>
          item.id || `${index}`
        }
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messagesContainer,
          messages.length === 0 &&
            styles.emptyMessagesContainer,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({
            animated: false,
          });
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={42}
                color="#10B981"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Start the conversation
            </Text>

            <Text style={styles.emptyText}>
              Ask the seller anything about
              this product.
            </Text>
          </View>
        }
        ListFooterComponent={
          partnerTyping ? (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>

              <Text
                style={styles.typingText}
              >
                {partner?.name ||
                  "Seller"}{" "}
                is typing...
              </Text>
            </View>
          ) : null
        }
      />

      {/* ======================================================
          INPUT
      ====================================================== */}

      <View style={styles.inputArea}>
        {!connected && (
          <View style={styles.warningBar}>
            <Ionicons
              name="cloud-offline-outline"
              size={15}
              color="#B45309"
            />

            <Text
              style={styles.warningText}
            >
              Connecting to chat...
            </Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            value={inputText}
            onChangeText={handleInputChange}
            placeholder={
              connected
                ? "Write a message..."
                : "Connecting..."
            }
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={2000}
            editable={connected}
            style={[
              styles.textInput,
              !connected &&
                styles.disabledInput,
            ]}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!connected ||
                !inputText.trim() ||
                sending) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={
              !connected ||
              !inputText.trim() ||
              sending
            }
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    minHeight: 70,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },

  headerPartner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },

  partnerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  statusIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  statusText: {
    fontSize: 12,
    color: "#6B7280",
  },

  connectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },

  connectionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 4,
  },

  connectionText: {
    fontSize: 9,
    color: "#6B7280",
  },

  /* ==========================================================
     AVATAR
  ========================================================== */

  avatar: {
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  avatarText: {
    color: "#047857",
    fontWeight: "700",
  },

  onlineDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  /* ==========================================================
     PRODUCT BAR
  ========================================================== */

  productBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ECFDF5",
    borderBottomWidth: 1,
    borderBottomColor: "#D1FAE5",
  },

  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },

  productInfo: {
    flex: 1,
    marginLeft: 10,
  },

  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  productPrice: {
    marginTop: 2,
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },

  /* ==========================================================
     MESSAGES
  ========================================================== */

  messagesContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 16,
  },

  emptyMessagesContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  messageRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-end",
  },

  myMessageRow: {
    justifyContent: "flex-end",
  },

  partnerMessageRow: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 13,
    paddingTop: 9,
    paddingBottom: 7,
    borderRadius: 16,
  },

  myBubble: {
    backgroundColor: "#059669",
    borderBottomRightRadius: 4,
    marginLeft: 35,
  },

  partnerBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },

  myMessageText: {
    color: "#FFFFFF",
  },

  partnerMessageText: {
    color: "#111827",
  },

  messageMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 3,
    gap: 3,
  },

  messageTime: {
    fontSize: 10,
  },

  myMessageTime: {
    color: "#D1FAE5",
  },

  partnerMessageTime: {
    color: "#9CA3AF",
  },

  /* ==========================================================
     EMPTY
  ========================================================== */

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },

  /* ==========================================================
     TYPING
  ========================================================== */

  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginLeft: 40,
  },

  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3,
  },

  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#9CA3AF",
  },

  typingText: {
    marginLeft: 7,
    fontSize: 11,
    color: "#9CA3AF",
  },

  /* ==========================================================
     INPUT
  ========================================================== */

  inputArea: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom:
      Platform.OS === "ios" ? 10 : 8,
  },

  warningBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  warningText: {
    fontSize: 11,
    color: "#B45309",
    marginLeft: 5,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: "#F3F4F6",
    borderRadius: 22,
    paddingHorizontal: 17,
    paddingTop: 11,
    paddingBottom: 10,
    fontSize: 15,
    color: "#111827",
    marginRight: 8,
  },

  disabledInput: {
    opacity: 0.6,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
});

