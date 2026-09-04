import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "../components/button";
import { Input } from "../components/input";
import {
    adminAcceptBccRequest,
    adminGetPendingBccRequests,
    adminRejectBccRequest,
    BccTransaction,
    User,
} from "../hooks/api";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export default function AdminBccRequestsScreen() {
  const [requests, setRequests] = useState<(BccTransaction & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const [rejectModal, setRejectModal] = useState<{ visible: boolean; creditId: string | null }>({
    visible: false,
    creditId: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [refundTrxId, setRefundTrxId] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await adminGetPendingBccRequests();
      setRequests(res.data.data ?? []);
    } catch (err) {
      console.error("Failed to load BCC requests:", err);
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

  const handleAccept = (creditId: string) => {
    Alert.alert("Accept request?", "This credits the user's BCC wallet.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        onPress: async () => {
          setActioningId(creditId);
          try {
            await adminAcceptBccRequest(creditId);
            setRequests((prev) => prev.filter((r) => r.id !== creditId));
          } catch (err: any) {
            Alert.alert("Error", err?.response?.data?.message || "Failed to accept");
          } finally {
            setActioningId(null);
          }
        },
      },
    ]);
  };

  const openRejectModal = (creditId: string) => {
    setRejectReason("");
    setRefundTrxId("");
    setRejectModal({ visible: true, creditId });
  };

  const submitReject = async () => {
    if (!rejectModal.creditId) return;
    if (!rejectReason.trim()) {
      Alert.alert("Reason required", "Let the user know why this was rejected.");
      return;
    }
    setActioningId(rejectModal.creditId);
    try {
      await adminRejectBccRequest(rejectModal.creditId, {
        rejectReason: rejectReason.trim(),
        refundTrxId: refundTrxId.trim() || undefined,
      });
      setRequests((prev) => prev.filter((r) => r.id !== rejectModal.creditId));
      setRejectModal({ visible: false, creditId: null });
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to reject");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 px-5 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-4 self-start">
          <Ionicons name="arrow-back" size={22} color="#10b981" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-2xl font-semibold">BCC Requests</Text>
        <Text className="text-gray-400 text-sm mt-1">
          {requests.length} pending purchase{requests.length === 1 ? "" : "s"}
        </Text>
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
        ) : requests.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="checkmark-done-circle-outline" size={36} color="#d1d5db" />
            <Text className="text-gray-300 text-sm mt-3">No pending requests</Text>
          </View>
        ) : (
          requests.map((req) => (
            <View
              key={req.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
              style={{ elevation: 1 }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
                  {req.user?.name}
                </Text>
                <Text className="text-gray-400 text-[11px]">{timeAgo(req.createdAt)}</Text>
              </View>
              <Text className="text-gray-400 text-xs mb-3" numberOfLines={1}>
                {req.user?.email}
              </Text>

              <View className="bg-blue-50 rounded-xl p-3 mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-blue-700 text-xs">Amount</Text>
                  <Text className="text-blue-900 text-sm font-bold">৳{req.amount}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-blue-700 text-xs">Method</Text>
                  <Text className="text-blue-900 text-xs font-medium">
                    {req.paymentGateway}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-blue-700 text-xs">Transaction ID</Text>
                  <Text className="text-blue-900 text-xs font-medium">
                    {req.transactionId}
                  </Text>
                </View>
                {req.numberUsedInTrx && (
                  <View className="flex-row justify-between">
                    <Text className="text-blue-700 text-xs">Sent from</Text>
                    <Text className="text-blue-900 text-xs font-medium">
                      {req.numberUsedInTrx}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row gap-2">
                <Button
                  label="Accept"
                  onPress={() => handleAccept(req.id)}
                  loading={actioningId === req.id}
                  size="sm"
                  className="flex-1"
                />
                <Button
                  label="Reject"
                  onPress={() => openRejectModal(req.id)}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  loading={actioningId === req.id}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Reject modal */}
      <Modal
        visible={rejectModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModal({ visible: false, creditId: null })}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-5 w-full">
            <Text className="text-gray-900 text-base font-semibold mb-1">Reject request</Text>
            <Text className="text-gray-400 text-xs mb-4">
              Let the user know why this was rejected
            </Text>
            <Input
              label="Reason"
              placeholder="e.g. Transaction ID doesn't match"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              style={{ minHeight: 70, textAlignVertical: "top" }}
            />
            <Input
              label="Refund transaction ID (optional)"
              placeholder="If a refund was already sent"
              value={refundTrxId}
              onChangeText={setRefundTrxId}
            />
            <View className="flex-row gap-3 mt-2">
              <Button
                label="Back"
                onPress={() => setRejectModal({ visible: false, creditId: null })}
                variant="secondary"
                size="md"
                className="flex-1"
              />
              <Button
                label="Confirm"
                onPress={submitReject}
                loading={actioningId === rejectModal.creditId}
                size="md"
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}