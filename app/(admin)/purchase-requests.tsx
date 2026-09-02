import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  adminGetPurchaseRequests,
  adminUpdatePurchasePayment,
  adminUpdatePurchaseStatus,
} from "../../hooks/api";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING:                     { bg: "bg-amber-100", text: "text-amber-700" },
  REJECTED_FROM_BRITTOO:       { bg: "bg-red-100",   text: "text-red-700"   },
  PRODUCT_SUBMITTED_BY_SELLER: { bg: "bg-blue-100",  text: "text-blue-700"  },
  PRODUCT_COLLECTED_BY_BUYER:  { bg: "bg-green-100", text: "text-green-700" },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  REJECTED_FROM_BRITTOO: "Rejected",
  PRODUCT_SUBMITTED_BY_SELLER: "Submitted by Seller",
  PRODUCT_COLLECTED_BY_BUYER: "Collected by Buyer",
};

const PAYMENT_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING:   { bg: "bg-gray-100",  text: "text-gray-500"  },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700" },
};

function Badge({ status, colorMap, labels }: { status: string; colorMap: Record<string, { bg: string; text: string }>; labels?: Record<string, string> }) {
  const c = colorMap[status] ?? { bg: "bg-gray-100", text: "text-gray-500" };
  return (
    <View className={`px-2 py-0.5 rounded-full ${c.bg}`}>
      <Text className={`text-[10px] font-medium ${c.text}`}>{labels?.[status] ?? status}</Text>
    </View>
  );
}

export default function AdminPurchaseRequestsScreen() {
  const [requests, setRequests]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]     = useState<any>(null);
  const [modal, setModal]           = useState(false);
  const [acting, setActing]         = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetPurchaseRequests();
      setRequests(res.data?.data ?? []);
    } catch (e: any) {
      console.error("Purchase requests failed:", {
        status: e?.response?.status,
        data: e?.response?.data,
        message: e?.message,
        url: e?.config?.url,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (r: any) => {
    setSelected(r);
    setModal(true);
    setShowRejectInput(false);
    setRejectReason("");
  };

  const handleStatus = async (status: string) => {
    if (status === "REJECTED_FROM_BRITTOO" && !rejectReason.trim()) {
      setShowRejectInput(true);
      return;
    }
    setActing(true);
    try {
      await adminUpdatePurchaseStatus(
        selected.id,
        status,
        status === "REJECTED_FROM_BRITTOO" ? rejectReason.trim() : undefined,
      );
      Alert.alert("Updated", `Status: ${STATUS_LABELS[status] ?? status}`);
      setModal(false);
      load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed");
    } finally {
      setActing(false);
    }
  };

  const handlePayment = async (paymentStatus: string) => {
    setActing(true);
    try {
      await adminUpdatePurchasePayment(selected.id, paymentStatus);
      Alert.alert("Updated", `Payment: ${paymentStatus}`);
      setModal(false);
      load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="pt-14 px-5 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-lg font-semibold">Purchase Requests</Text>
        </View>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#111827" />
        }
        renderItem={({ item: r }) => (
          <TouchableOpacity
            onPress={() => openModal(r)}
            activeOpacity={0.85}
            className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
            style={{ elevation: 1, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }}
          >
            <View className="flex-row items-start justify-between mb-2">
              <Text className="text-gray-900 font-semibold text-sm flex-1 pr-2" numberOfLines={1}>
                {r.product?.name ?? "—"}
              </Text>
              <Badge status={r.status ?? "PENDING"} colorMap={STATUS_COLORS} labels={STATUS_LABELS} />
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1">
                <Ionicons name="person-outline" size={12} color="#9ca3af" />
                <Text className="text-gray-400 text-xs">{r.buyer?.name ?? "—"}</Text>
              </View>
              <View className="flex-row gap-2 items-center">
                {r.paymentStatus && <Badge status={r.paymentStatus} colorMap={PAYMENT_COLORS} />}
                {r.offerPrice && (
                  <Text className="text-gray-700 text-xs font-semibold">৳{r.offerPrice}</Text>
                )}
              </View>
            </View>
            <Text className="text-gray-300 text-xs mt-1.5">
              {new Date(r.createdAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-20">
              <Ionicons name="card-outline" size={36} color="#e5e7eb" />
              <Text className="text-gray-300 text-sm mt-3">No purchase requests</Text>
            </View>
          ) : null
        }
      />

      {loading && requests.length === 0 && (
        <View className="absolute inset-0 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#111827" />
        </View>
      )}

      {/* Detail Modal */}
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 pt-6 pb-4 border-b border-gray-100">
            <Text className="text-gray-900 text-lg font-semibold">Purchase Detail</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            {selected && (
              <>
                <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
                  <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Product</Text>
                  <Text className="text-gray-900 font-semibold">{selected.product?.name ?? "—"}</Text>
                  {selected.offerPrice && (
                    <Text className="text-gray-500 text-sm mt-1">Offer: ৳{selected.offerPrice}</Text>
                  )}
                </View>

                <View className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
                  <Text className="text-gray-400 text-sm">Request status</Text>
                  <Badge status={selected.status ?? "PENDING"} colorMap={STATUS_COLORS} labels={STATUS_LABELS} />
                </View>

                {selected.paymentStatus && (
                  <View className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
                    <Text className="text-gray-400 text-sm">Payment status</Text>
                    <Badge status={selected.paymentStatus} colorMap={PAYMENT_COLORS} />
                  </View>
                )}

                {selected.brittooRejectReason && (
                  <View className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
                    <Text className="text-red-700 text-xs font-medium mb-1">Reject reason</Text>
                    <Text className="text-red-600 text-sm">{selected.brittooRejectReason}</Text>
                  </View>
                )}

                <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Update Request Status</Text>
                {(["PRODUCT_SUBMITTED_BY_SELLER", "PRODUCT_COLLECTED_BY_BUYER", "REJECTED_FROM_BRITTOO"] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => handleStatus(s)}
                    disabled={acting || selected.status === s}
                    className={`border rounded-xl px-4 py-3 mb-2 ${selected.status === s ? "border-gray-900 bg-gray-900" : "border-gray-200 bg-white"}`}
                  >
                    <Text className={`text-sm font-medium ${selected.status === s ? "text-white" : "text-gray-700"}`}>
                      {selected.status === s ? "✓ " : ""}{STATUS_LABELS[s]}
                    </Text>
                  </TouchableOpacity>
                ))}

                {showRejectInput && (
                  <View className="mt-2 mb-3">
                    <TextInput
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChangeText={setRejectReason}
                      multiline
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 mb-2"
                      style={{ minHeight: 60, textAlignVertical: "top" }}
                    />
                    <TouchableOpacity
                      onPress={() => handleStatus("REJECTED_FROM_BRITTOO")}
                      disabled={acting || !rejectReason.trim()}
                      className="bg-red-600 rounded-xl px-4 py-3 items-center"
                    >
                      <Text className="text-white text-sm font-medium">Confirm Rejection</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selected.paymentStatus !== undefined && (
                  <>
                    <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mt-4 mb-3">Update Payment Status</Text>
                    {(["PENDING", "COMPLETED"] as const).map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => handlePayment(s)}
                        disabled={acting || selected.paymentStatus === s}
                        className={`border rounded-xl px-4 py-3 mb-2 ${selected.paymentStatus === s ? "border-gray-900 bg-gray-900" : "border-gray-200 bg-white"}`}
                      >
                        <Text className={`text-sm font-medium ${selected.paymentStatus === s ? "text-white" : "text-gray-700"}`}>
                          {selected.paymentStatus === s ? "✓ " : ""}{s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}