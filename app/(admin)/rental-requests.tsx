import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
  Modal, ScrollView, Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  adminGetRentalRequests,
  adminUpdateRentalStatus,
  adminRejectRental,
} from "../../hooks/api";
import { useAdminGuard } from "../../hooks/useAdminGuard";
import { Button } from "../../components/button";
import { Input } from "../../components/input";

type StatusFilter = "ALL" | "PENDING" | "ACCEPTED_BY_OWNER" | "PRODUCT_SUBMITTED_BY_OWNER" |
  "PRODUCT_COLLECTED_BY_RENTER" | "PRODUCT_RETURNED_BY_RENTER" |
  "PRODUCT_RETURNED_TO_OWNER" | "REJECTED_FROM_BRITTOO" |
  "CANCELLED_BY_RENTER" | "REJECTED_BY_OWNER";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All",           value: "" },
  { label: "Pending",       value: "PENDING" },
  { label: "Accepted",      value: "ACCEPTED_BY_OWNER" },
  { label: "Submitted",     value: "PRODUCT_SUBMITTED_BY_OWNER" },
  { label: "Collected",     value: "PRODUCT_COLLECTED_BY_RENTER" },
  { label: "Returned",      value: "PRODUCT_RETURNED_BY_RENTER" },
  { label: "Completed",     value: "PRODUCT_RETURNED_TO_OWNER" },
  { label: "Rejected",      value: "REJECTED_FROM_BRITTOO" },
  { label: "Cancelled",     value: "CANCELLED_BY_RENTER" },
];

const UPDATABLE_STATUSES = [
  { label: "Product Submitted by Owner",       value: "PRODUCT_SUBMITTED_BY_OWNER" },
  { label: "Product Collected by Renter",      value: "PRODUCT_COLLECTED_BY_RENTER" },
  { label: "Product Returned by Renter",       value: "PRODUCT_RETURNED_BY_RENTER" },
  { label: "Product Returned to Owner (done)", value: "PRODUCT_RETURNED_TO_OWNER" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING:                       { bg: "bg-gray-100",   text: "text-gray-600"  },
  ACCEPTED_BY_OWNER:             { bg: "bg-blue-100",   text: "text-blue-700"  },
  PRODUCT_SUBMITTED_BY_OWNER:    { bg: "bg-violet-100", text: "text-violet-700"},
  PRODUCT_COLLECTED_BY_RENTER:   { bg: "bg-amber-100",  text: "text-amber-700" },
  PRODUCT_RETURNED_BY_RENTER:    { bg: "bg-orange-100", text: "text-orange-700"},
  PRODUCT_RETURNED_TO_OWNER:     { bg: "bg-green-100",  text: "text-green-700" },
  REJECTED_FROM_BRITTOO:         { bg: "bg-red-100",    text: "text-red-700"   },
  REJECTED_BY_OWNER:             { bg: "bg-red-100",    text: "text-red-600"   },
  CANCELLED_BY_RENTER:           { bg: "bg-gray-100",   text: "text-gray-500"  },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: "bg-gray-100", text: "text-gray-500" };
  const label = status.replace(/_/g, " ").toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
  return (
    <View className={`px-2 py-0.5 rounded-full ${c.bg}`}>
      <Text className={`text-[10px] font-medium ${c.text}`} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function AdminRentalRequestsScreen() {
  const { ready } = useAdminGuard();
  const [requests, setRequests]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail modal
  const [selected, setSelected]     = useState<any>(null);
  const [modalVisible, setModal]    = useState(false);
  const [acting, setActing]         = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const fetchRequests = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    setLoading(true);
    try {
      const res = await adminGetRentalRequests({
        page: p, limit: 15,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const { data, meta } = res.data;
      setRequests(reset ? data : (prev) => [...prev, ...data]);
      setTotalPages(meta.totalPages);
      if (!reset) setPage((x) => x + 1); else setPage(2);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, statusFilter, page]);

  useEffect(() => {
    if (!ready) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchRequests(true), 350);
  }, [search, statusFilter, ready]);

  const openDetail = (item: any) => {
    setSelected(item);
    setShowReject(false);
    setRejectReason("");
    setModal(true);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selected) return;
    setActing(true);
    try {
      await adminUpdateRentalStatus(selected.id, newStatus);
      Alert.alert("Updated", `Status set to: ${newStatus.replace(/_/g, " ")}`);
      setModal(false);
      fetchRequests(true);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Update failed");
    } finally { setActing(false); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert("Required", "Please enter a reject reason");
      return;
    }
    setActing(true);
    try {
      await adminRejectRental(selected.id, rejectReason.trim());
      Alert.alert("Rejected", "Rental request rejected and BCC/RCC refunded");
      setModal(false);
      fetchRequests(true);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Reject failed");
    } finally { setActing(false); }
  };

  if (!ready) return null;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 px-5 pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-lg font-semibold flex-1">Rental Requests</Text>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 mb-3">
          <Ionicons name="search-outline" size={15} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 py-2.5 text-sm text-gray-900"
            placeholder="Search product, owner, renter..."
            placeholderTextColor="#d1d5db"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={15} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setStatus(f.value)}
                className={`px-3 py-1.5 rounded-full border ${active ? "bg-gray-900 border-gray-900" : "bg-white border-gray-200"}`}
              >
                <Text className={`text-xs font-medium ${active ? "text-white" : "text-gray-600"}`}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={requests}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(true); }} tintColor="#111827" />
        }
        onEndReached={() => { if (!loading && page <= totalPages) fetchRequests(); }}
        onEndReachedThreshold={0.4}
        renderItem={({ item: r }) => (
          <TouchableOpacity
            onPress={() => openDetail(r)}
            activeOpacity={0.85}
            className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
            style={{ elevation: 1, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }}
          >
            {/* Product name + status */}
            <View className="flex-row items-start justify-between mb-2">
              <Text className="text-gray-900 font-semibold text-sm flex-1 pr-2" numberOfLines={1}>
                {r.product?.name ?? "—"}
              </Text>
              <StatusBadge status={r.status} />
            </View>

            {/* People row */}
            <View className="flex-row gap-3 mb-2">
              <View className="flex-1 flex-row items-center gap-1">
                <Ionicons name="person-outline" size={12} color="#9ca3af" />
                <Text className="text-gray-400 text-xs" numberOfLines={1}>
                  Owner: {r.owner?.name ?? "—"}
                </Text>
              </View>
              <View className="flex-1 flex-row items-center gap-1">
                <Ionicons name="people-outline" size={12} color="#9ca3af" />
                <Text className="text-gray-400 text-xs" numberOfLines={1}>
                  Renter: {r.requester?.name ?? "—"}
                </Text>
              </View>
            </View>

            {/* Dates + payment */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={11} color="#9ca3af" />
                <Text className="text-gray-400 text-xs">
                  {r.rentalStartDate ? new Date(r.rentalStartDate).toLocaleDateString() : "—"}
                  {" → "}
                  {r.rentalEndDate ? new Date(r.rentalEndDate).toLocaleDateString() : "—"}
                </Text>
              </View>
              <View className="flex-row gap-2">
                {r.paidWithBcc && (
                  <View className="bg-blue-50 px-1.5 py-0.5 rounded">
                    <Text className="text-blue-600 text-[10px] font-medium">BCC {r.usedBccAmount}</Text>
                  </View>
                )}
                {r.paidWithRcc && (
                  <View className="bg-red-50 px-1.5 py-0.5 rounded">
                    <Text className="text-red-500 text-[10px] font-medium">RCC</Text>
                  </View>
                )}
              </View>
            </View>

            {r.brittooRejectReason && (
              <View className="mt-2 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                <Text className="text-red-500 text-xs">Reject reason: {r.brittooRejectReason}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-20">
              <Ionicons name="swap-horizontal-outline" size={36} color="#e5e7eb" />
              <Text className="text-gray-300 text-sm mt-3">No rental requests found</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && requests.length > 0
            ? <View className="py-6 items-center"><ActivityIndicator size="small" color="#6b7280" /></View>
            : null
        }
      />

      {loading && requests.length === 0 && (
        <View className="absolute inset-0 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#111827" />
        </View>
      )}

      {/* ── Detail Modal ── */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 pt-6 pb-4 border-b border-gray-100">
            <Text className="text-gray-900 text-lg font-semibold">Request Detail</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            {selected && (
              <>
                {/* Product */}
                <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
                  <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Product</Text>
                  <Text className="text-gray-900 font-semibold text-base mb-1">{selected.product?.name}</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-gray-400 text-xs font-mono">{selected.product?.productSL}</Text>
                    <Text className="text-gray-300 text-xs">•</Text>
                    <Text className="text-gray-400 text-xs">৳{selected.product?.pricePerDay}/day</Text>
                  </View>
                </View>

                {/* Parties */}
                <View className="flex-row gap-3 mb-4">
                  {[
                    { label: "Owner",  user: selected.owner },
                    { label: "Renter", user: selected.requester },
                  ].map(({ label, user }) => (
                    <View key={label} className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-3">
                      <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-2">{label}</Text>
                      <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>{user?.name}</Text>
                      <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>{user?.email}</Text>
                      <View className="flex-row items-center gap-1 mt-1">
                        <Text className="text-gray-400 text-xs">{user?.securityScore}</Text>
                        {user?.brittooVerified && (
                          <Ionicons name="checkmark-circle" size={11} color="#2563eb" />
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Rental period */}
                <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
                  <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Rental Period</Text>
                  {[
                    { l: "Start date",  v: selected.rentalStartDate ? new Date(selected.rentalStartDate).toLocaleDateString() : "—" },
                    { l: "End date",    v: selected.rentalEndDate   ? new Date(selected.rentalEndDate).toLocaleDateString()   : "—" },
                    { l: "Total days",  v: `${selected.totalDays ?? "—"} days` },
                    { l: "Deadline",    v: selected.submissionDeadline ? new Date(selected.submissionDeadline).toLocaleDateString() : "—" },
                  ].map(({ l, v }) => (
                    <View key={l} className="flex-row justify-between py-2 border-b border-gray-100 last:border-0">
                      <Text className="text-gray-400 text-sm">{l}</Text>
                      <Text className="text-gray-900 text-sm font-medium">{v}</Text>
                    </View>
                  ))}
                </View>

                {/* Payment */}
                <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
                  <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Payment</Text>
                  {[
                    { l: "Paid with BCC",  v: selected.paidWithBcc  ? `Yes — ${selected.usedBccAmount} BCC` : "No" },
                    { l: "Paid with RCC",  v: selected.paidWithRcc  ? "Yes" : "No" },
                  ].map(({ l, v }) => (
                    <View key={l} className="flex-row justify-between py-2 border-b border-gray-100 last:border-0">
                      <Text className="text-gray-400 text-sm">{l}</Text>
                      <Text className="text-gray-900 text-sm font-medium">{v}</Text>
                    </View>
                  ))}
                  {/* RCC details */}
                  {selected.rccUsageDetails?.length > 0 && (
                    <View className="mt-2">
                      <Text className="text-gray-400 text-xs mb-1">RCC sources:</Text>
                      {selected.rccUsageDetails.map((u: any, i: number) => (
                        <Text key={i} className="text-gray-500 text-xs">
                          • {u.redCacheCredit?.sourceProduct?.name}: ৳{u.usedAmount}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>

                {/* Current status */}
                <View className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
                  <Text className="text-gray-400 text-sm">Current status</Text>
                  <StatusBadge status={selected.status} />
                </View>

                {/* Actions */}
                {!["PRODUCT_RETURNED_TO_OWNER", "REJECTED_FROM_BRITTOO", "CANCELLED_BY_RENTER", "REJECTED_BY_OWNER"].includes(selected.status) && (
                  <View className="gap-3">
                    <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium">Update Status</Text>
                    {UPDATABLE_STATUSES.map((s) => (
                      <TouchableOpacity
                        key={s.value}
                        onPress={() => handleUpdateStatus(s.value)}
                        disabled={acting || selected.status === s.value}
                        className={`border rounded-xl px-4 py-3 ${selected.status === s.value ? "border-gray-900 bg-gray-900" : "border-gray-200 bg-white"} ${acting ? "opacity-50" : ""}`}
                        activeOpacity={0.85}
                      >
                        <Text className={`text-sm font-medium ${selected.status === s.value ? "text-white" : "text-gray-700"}`}>
                          {selected.status === s.value ? "✓ " : ""}{s.label}
                        </Text>
                      </TouchableOpacity>
                    ))}

                    {/* Reject */}
                    <View className="mt-2">
                      {!showReject ? (
                        <Button
                          label="Reject from Brittoo"
                          onPress={() => setShowReject(true)}
                          variant="danger"
                          size="md"
                        />
                      ) : (
                        <View className="bg-red-50 border border-red-100 rounded-2xl p-4 gap-3">
                          <Text className="text-red-700 font-semibold text-sm">Reject Request</Text>
                          <Text className="text-red-400 text-xs">
                            This will refund BCC to the renter's locked balance and release any RCC in use.
                          </Text>
                          <Input
                            label="Reject reason (required)"
                            placeholder="Explain why this request is being rejected..."
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            multiline
                            numberOfLines={3}
                            style={{ minHeight: 72, textAlignVertical: "top" }}
                          />
                          <View className="flex-row gap-3">
                            <Button label="Cancel" onPress={() => setShowReject(false)} variant="secondary" size="md" className="flex-1" />
                            <Button label="Confirm Reject" onPress={handleReject} loading={acting} variant="danger" size="md" className="flex-1" />
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
