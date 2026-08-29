import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { STORAGE_KEYS } from "../../constants";
import {
    acceptPurchaseRequest,
    AcceptPurchaseRequestPayload,
    acceptRentalRequest,
    BACKEND_URL,
    cancelPurchaseRequest,
    cancelRentalRequest,
    getOwnerRentalRequests,
    getPlacedPurchaseRequests,
    getReceivedPurchaseRequests,
    getUserPlacedRentalRequests,
    PurchaseCollectionMethod,
    PurchaseRequest,
    rejectPurchaseRequest,
    rejectRentalRequest,
} from "../../hooks/api";

type RequestType = "purchase" | "rental";
type Tab = "placed" | "received";

// The rental-request backend response shape isn't finalized yet (see
// rental-request.tsx), so this is a defensive, loosely-typed shape — every
// field is read with optional chaining and sensible fallbacks below.
interface RentalRequestItem {
  id: string;
  status: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  product?: {
    id: string;
    name: string;
    productImages?: string[];
    optimizedImages?: string[];
    pricePerDay?: number;
    owner?: { name: string };
  };
  renter?: { name: string };
  requester?: { name: string };
  owner?: { name: string };
  [key: string]: any;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "#fef3c7", text: "#b45309" },
  ACCEPTED: { bg: "#d1fae5", text: "#047857" },
  REJECTED: { bg: "#fee2e2", text: "#b91c1c" },
  CANCELLED: { bg: "#f3f4f6", text: "#6b7280" },
  CANCELED: { bg: "#f3f4f6", text: "#6b7280" },
  COMPLETED: { bg: "#dbeafe", text: "#1d4ed8" },
};

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status?.toUpperCase()] ?? {
    bg: "#f3f4f6",
    text: "#6b7280",
  };
  return (
    <View
      className="rounded-full px-2.5 py-1 self-start"
      style={{ backgroundColor: colors.bg }}
    >
      <Text className="text-xs font-semibold" style={{ color: colors.text }}>
        {status?.replace(/_/g, " ") ?? "UNKNOWN"}
      </Text>
    </View>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// All accept/reject/cancel routes (both purchase and rental) sit behind
// `verificationMiddleware` on the backend, which returns
// `errorType: "VERIFICATION_ERROR"` for unverified accounts.
function showActionError(err: any, fallback: string) {
  if (err?.response?.data?.errorType === "VERIFICATION_ERROR") {
    Alert.alert("Verification required", "Please verify your account to do this.");
  } else {
    Alert.alert("Error", err?.response?.data?.message || fallback);
  }
}

export default function RequestsScreen() {
  const params = useLocalSearchParams<{ type?: string; tab?: string }>();
  const [type, setType] = useState<RequestType>(
    params.type === "rental" ? "rental" : "purchase",
  );
  const [tab, setTab] = useState<Tab>(params.tab === "received" ? "received" : "placed");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseRequest[]>([]);
  const [rentalItems, setRentalItems] = useState<RentalRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // reason modal (reject / cancel)
  const [reasonModal, setReasonModal] = useState<{
    visible: boolean;
    kind: "reject" | "cancel";
    requestId: string | null;
  }>({ visible: false, kind: "cancel", requestId: null });
  const [reasonText, setReasonText] = useState("");

  // accept-purchase modal
  const [acceptModal, setAcceptModal] = useState<{
    visible: boolean;
    requestId: string | null;
  }>({ visible: false, requestId: null });
  const [sellerDeliveryMethod, setSellerDeliveryMethod] =
    useState<PurchaseCollectionMethod>("HOME");
  const [sellerPhoneNumber, setSellerPhoneNumber] = useState("");
  const [sellerDeliveryAddress, setSellerDeliveryAddress] = useState("");
  const [sellerDeliveryTerminal, setSellerDeliveryTerminal] = useState("");
  const [acceptErrors, setAcceptErrors] = useState<Record<string, string>>({});
  const [acceptSubmitting, setAcceptSubmitting] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEYS.USER).then((s) => {
      if (s) setCurrentUserId(JSON.parse(s).id);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (type === "purchase") {
        const res =
          tab === "placed"
            ? await getPlacedPurchaseRequests()
            : await getReceivedPurchaseRequests();
        setPurchaseItems(res.data.data ?? []);
      } else {
        const res =
          tab === "placed"
            ? await getUserPlacedRentalRequests()
            : await getOwnerRentalRequests();
        const list = (res as any).data?.data ?? (res as any).data ?? [];
        setRentalItems(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type, tab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  // ── Purchase actions ────────────────────────────────────────────────
  const openReasonModal = (kind: "reject" | "cancel", requestId: string) => {
    setReasonText("");
    setReasonModal({ visible: true, kind, requestId });
  };

  const submitReasonModal = async () => {
    if (!reasonModal.requestId) return;
    if (!reasonText.trim()) {
      Alert.alert("Reason required", "Please tell them why.");
      return;
    }
    setActioningId(reasonModal.requestId);
    try {
      if (reasonModal.kind === "cancel") {
        await cancelPurchaseRequest(reasonModal.requestId, reasonText);
      } else {
        await rejectPurchaseRequest(reasonModal.requestId, reasonText);
      }
      setReasonModal({ visible: false, kind: "cancel", requestId: null });
      load();
    } catch (err: any) {
      showActionError(err, "Action failed");
    } finally {
      setActioningId(null);
    }
  };

  const openAcceptModal = (requestId: string) => {
    setSellerDeliveryMethod("HOME");
    setSellerPhoneNumber("");
    setSellerDeliveryAddress("");
    setSellerDeliveryTerminal("");
    setAcceptErrors({});
    setAcceptModal({ visible: true, requestId });
  };

  const submitAcceptModal = async () => {
    if (!acceptModal.requestId) return;
    const e: Record<string, string> = {};
    if (!sellerPhoneNumber.trim()) e.sellerPhoneNumber = "Phone number is required";
    if (sellerDeliveryMethod === "HOME" && !sellerDeliveryAddress.trim()) {
      e.sellerDeliveryAddress = "Delivery address is required";
    }
    if (sellerDeliveryMethod === "BRITTOO_TERMINAL" && !sellerDeliveryTerminal.trim()) {
      e.sellerDeliveryTerminal = "Delivery terminal is required";
    }
    setAcceptErrors(e);
    if (Object.keys(e).length > 0) return;

    const payload: AcceptPurchaseRequestPayload = {
      sellerDeliveryMethod,
      sellerPhoneNumber,
      sellerDeliveryAddress:
        sellerDeliveryMethod === "HOME" ? sellerDeliveryAddress : null,
      sellerDeliveryTerminal:
        sellerDeliveryMethod === "BRITTOO_TERMINAL" ? sellerDeliveryTerminal : null,
    };

    setAcceptSubmitting(true);
    try {
      await acceptPurchaseRequest(acceptModal.requestId, payload);
      setAcceptModal({ visible: false, requestId: null });
      load();
    } catch (err: any) {
      showActionError(err, "Failed to accept");
    } finally {
      setAcceptSubmitting(false);
    }
  };

  // ── Rental actions (no request body needed) ────────────────────────
  const confirmRentalAction = (
    action: "accept" | "reject" | "cancel",
    requestId: string,
  ) => {
    const labels = {
      accept: { title: "Accept request", msg: "Accept this rental request?" },
      reject: { title: "Reject request", msg: "Reject this rental request?" },
      cancel: { title: "Cancel request", msg: "Cancel this rental request?" },
    }[action];

    Alert.alert(labels.title, labels.msg, [
      { text: "Back", style: "cancel" },
      {
        text: labels.title.split(" ")[0],
        style: action === "reject" || action === "cancel" ? "destructive" : "default",
        onPress: async () => {
          setActioningId(requestId);
          try {
            if (action === "accept") await acceptRentalRequest(requestId);
            if (action === "reject") await rejectRentalRequest(requestId);
            if (action === "cancel") await cancelRentalRequest(requestId);
            load();
          } catch (err: any) {
            showActionError(err, "Action failed");
          } finally {
            setActioningId(null);
          }
        },
      },
    ]);
  };

  // ── Render helpers ──────────────────────────────────────────────────
  const renderPurchaseCard = (item: PurchaseRequest) => {
    const thumb =
      item.product?.optimizedImages?.[0] || item.product?.productImages?.[0];
    const counterpart = tab === "placed" ? item.seller : item.buyer;
    const isPending = item.status?.toUpperCase() === "PENDING";

    return (
      <View
        key={item.id}
        className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
        style={{ elevation: 1 }}
      >
        <View className="flex-row items-center gap-3 mb-3">
          {thumb ? (
            <Image
              source={{ uri: `${BACKEND_URL}${thumb}` }}
              className="w-12 h-12 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center">
              <Ionicons name="cube-outline" size={18} color="#9ca3af" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
              {item.product?.name ?? "Product"}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              {tab === "placed" ? "Seller" : "Buyer"}: {counterpart?.name ?? "—"}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-400 text-xs">Deal price</Text>
          <Text className="text-gray-900 text-xs font-semibold">
            ৳{item.dealPrice}
          </Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-400 text-xs">Total (with platform fee)</Text>
          <Text className="text-gray-900 text-xs font-semibold">
            ৳{item.totalPrice}
          </Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-400 text-xs">Requested</Text>
          <Text className="text-gray-500 text-xs">{formatDate(item.createdAt)}</Text>
        </View>

        {isPending && tab === "placed" && (
          <Button
            label="Cancel request"
            onPress={() => openReasonModal("cancel", item.id)}
            variant="secondary"
            size="sm"
            loading={actioningId === item.id}
          />
        )}

        {isPending && tab === "received" && (
          <View className="flex-row gap-2">
            <Button
              label="Accept"
              onPress={() => openAcceptModal(item.id)}
              size="sm"
              className="flex-1"
              loading={actioningId === item.id}
            />
            <Button
              label="Reject"
              onPress={() => openReasonModal("reject", item.id)}
              variant="secondary"
              size="sm"
              className="flex-1"
              loading={actioningId === item.id}
            />
          </View>
        )}
      </View>
    );
  };

  const renderRentalCard = (item: RentalRequestItem) => {
    const thumb =
      item.product?.optimizedImages?.[0] || item.product?.productImages?.[0];
    const counterpartName =
      tab === "placed"
        ? item.product?.owner?.name
        : item.renter?.name ?? item.requester?.name;
    const status = item.status?.toUpperCase() ?? "PENDING";
    const isPending = status === "PENDING";

    return (
      <View
        key={item.id}
        className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
        style={{ elevation: 1 }}
      >
        <View className="flex-row items-center gap-3 mb-3">
          {thumb ? (
            <Image
              source={{ uri: `${BACKEND_URL}${thumb}` }}
              className="w-12 h-12 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center">
              <Ionicons name="cube-outline" size={18} color="#9ca3af" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
              {item.product?.name ?? "Product"}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              {tab === "placed" ? "Owner" : "Renter"}: {counterpartName ?? "—"}
            </Text>
          </View>
          <StatusBadge status={status} />
        </View>

        {(item.startDate || item.endDate) && (
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-400 text-xs">Dates</Text>
            <Text className="text-gray-900 text-xs font-medium">
              {formatDate(item.startDate)} – {formatDate(item.endDate)}
            </Text>
          </View>
        )}
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-400 text-xs">Requested</Text>
          <Text className="text-gray-500 text-xs">{formatDate(item.createdAt)}</Text>
        </View>

        {isPending && tab === "placed" && (
          <Button
            label="Cancel request"
            onPress={() => confirmRentalAction("cancel", item.id)}
            variant="secondary"
            size="sm"
            loading={actioningId === item.id}
          />
        )}

        {isPending && tab === "received" && (
          <View className="flex-row gap-2">
            <Button
              label="Accept"
              onPress={() => confirmRentalAction("accept", item.id)}
              size="sm"
              className="flex-1"
              loading={actioningId === item.id}
            />
            <Button
              label="Reject"
              onPress={() => confirmRentalAction("reject", item.id)}
              variant="secondary"
              size="sm"
              className="flex-1"
              loading={actioningId === item.id}
            />
          </View>
        )}
      </View>
    );
  };

  const items = type === "purchase" ? purchaseItems : rentalItems;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 px-5 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-4 self-start">
          <Ionicons name="arrow-back" size={22} color="#10b981" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-2xl font-semibold">My Requests</Text>
        <Text className="text-gray-400 text-sm mt-1">
          Track your rental and purchase requests
        </Text>
      </View>

      {/* Type toggle */}
      <View className="flex-row px-5 pt-4 gap-2">
        {(["purchase", "rental"] as RequestType[]).map((t) => {
          const active = type === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              className={`flex-1 items-center py-2.5 rounded-xl border ${
                active ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${active ? "text-white" : "text-gray-600"}`}
              >
                {t === "purchase" ? "Purchase" : "Rental"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Placed / Received sub-tabs */}
      <View className="flex-row px-5 pt-3 gap-4 border-b border-gray-100 pb-3">
        {(["placed", "received"] as Tab[]).map((tb) => {
          const active = tab === tb;
          return (
            <TouchableOpacity key={tb} onPress={() => setTab(tb)}>
              <Text
                className={`text-sm ${
                  active ? "text-emerald-700 font-semibold" : "text-gray-400 font-medium"
                }`}
              >
                {tb === "placed" ? "Placed by me" : "Received"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
        }
      >
        {loading && !refreshing ? (
          <View className="items-center py-16">
            <ActivityIndicator size="small" color="#10b981" />
          </View>
        ) : items.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="file-tray-outline" size={36} color="#d1d5db" />
            <Text className="text-gray-300 text-sm mt-3">No requests here yet</Text>
          </View>
        ) : type === "purchase" ? (
          purchaseItems.map(renderPurchaseCard)
        ) : (
          rentalItems.map(renderRentalCard)
        )}
      </ScrollView>

      {/* Reason modal — reject / cancel */}
      <Modal
        visible={reasonModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setReasonModal({ visible: false, kind: "cancel", requestId: null })
        }
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-5 w-full">
            <Text className="text-gray-900 text-base font-semibold mb-1">
              {reasonModal.kind === "cancel" ? "Cancel request" : "Reject request"}
            </Text>
            <Text className="text-gray-400 text-xs mb-4">
              Let them know why — this is shared with the other party.
            </Text>
            <Input
              label="Reason"
              placeholder="e.g. Changed my mind"
              value={reasonText}
              onChangeText={setReasonText}
              multiline
              numberOfLines={3}
              style={{ minHeight: 70, textAlignVertical: "top" }}
            />
            <View className="flex-row gap-3 mt-2">
              <Button
                label="Back"
                onPress={() =>
                  setReasonModal({ visible: false, kind: "cancel", requestId: null })
                }
                variant="secondary"
                size="md"
                className="flex-1"
              />
              <Button
                label="Confirm"
                onPress={submitReasonModal}
                loading={actioningId === reasonModal.requestId}
                size="md"
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Accept purchase modal */}
      <Modal
        visible={acceptModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setAcceptModal({ visible: false, requestId: null })}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <ScrollView className="bg-white rounded-2xl p-5 w-full" style={{ maxHeight: "85%" }}>
            <Text className="text-gray-900 text-base font-semibold mb-1">
              Accept purchase request
            </Text>
            <Text className="text-gray-400 text-xs mb-4">
              Tell the buyer how you'll deliver the item
            </Text>

            <View className="gap-2 mb-3">
              {(["HOME", "BRITTOO_TERMINAL"] as PurchaseCollectionMethod[]).map((m) => {
                const active = sellerDeliveryMethod === m;
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setSellerDeliveryMethod(m)}
                    className={`px-3 py-2.5 rounded-xl border ${
                      active ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${active ? "text-white" : "text-gray-600"}`}
                    >
                      {m === "HOME" ? "I'll deliver to their address" : "They'll pick up from a terminal"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Input
              label="Your phone number"
              placeholder="e.g. 01700000000"
              leftIcon="call-outline"
              value={sellerPhoneNumber}
              onChangeText={setSellerPhoneNumber}
              error={acceptErrors.sellerPhoneNumber}
              keyboardType="phone-pad"
            />

            {sellerDeliveryMethod === "HOME" ? (
              <Input
                label="Delivery address"
                placeholder="Where will you deliver from/to?"
                leftIcon="location-outline"
                value={sellerDeliveryAddress}
                onChangeText={setSellerDeliveryAddress}
                error={acceptErrors.sellerDeliveryAddress}
                multiline
                numberOfLines={2}
                style={{ minHeight: 60, textAlignVertical: "top" }}
              />
            ) : (
              <Input
                label="Delivery terminal"
                placeholder="e.g. RUET Terminal"
                leftIcon="business-outline"
                value={sellerDeliveryTerminal}
                onChangeText={setSellerDeliveryTerminal}
                error={acceptErrors.sellerDeliveryTerminal}
              />
            )}

            <View className="flex-row gap-3 mt-2">
              <Button
                label="Back"
                onPress={() => setAcceptModal({ visible: false, requestId: null })}
                variant="secondary"
                size="md"
                className="flex-1"
              />
              <Button
                label="Accept"
                onPress={submitAcceptModal}
                loading={acceptSubmitting}
                size="md"
                className="flex-1"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}