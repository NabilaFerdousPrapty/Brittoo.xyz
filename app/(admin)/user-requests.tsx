import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { adminGetUserPlacedRequests, adminGetUserReceivedRequests } from "../../hooks/api";
import { useAdminGuard } from "../../hooks/useAdminGuard";

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
  const label = status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  return (
    <View className={`px-2 py-0.5 rounded-full ${c.bg}`}>
      <Text className={`text-[10px] font-medium ${c.text}`} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function AdminUserRequestsScreen() {
  const { ready } = useAdminGuard();
  const { userId, type } = useLocalSearchParams<{ userId: string; type: "placed" | "received" }>();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = type === "received"
        ? await adminGetUserReceivedRequests(userId!)
        : await adminGetUserPlacedRequests(userId!);
      setRequests(res.data.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { if (ready && userId) load(); }, [ready, userId, type]);

  if (!ready) return null;

  const isReceived = type === "received";

  return (
    <View className="flex-1 bg-white">
      <View className="pt-14 px-5 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-lg font-semibold">
            {isReceived ? "Received Requests" : "Placed Requests"}
          </Text>
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
          <View
            className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
            style={{ elevation: 1, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }}
          >
            {/* Product + status */}
            <View className="flex-row items-start justify-between mb-2">
              <Text className="text-gray-900 font-semibold text-sm flex-1 pr-2" numberOfLines={1}>
                {r.product?.name ?? "—"}
              </Text>
              <StatusBadge status={r.status} />
            </View>

            {/* Counterparty */}
            <View className="flex-row items-center gap-1 mb-2">
              <Ionicons name="person-outline" size={12} color="#9ca3af" />
              <Text className="text-gray-400 text-xs">
                {isReceived
                  ? `Renter: ${r.requester?.name ?? "—"}`
                  : `Owner: ${r.owner?.name ?? r.product?.owner?.name ?? "—"}`}
              </Text>
            </View>

            {/* Dates + price */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={11} color="#9ca3af" />
                <Text className="text-gray-400 text-xs">
                  {r.rentalStartDate ? new Date(r.rentalStartDate).toLocaleDateString() : "—"}
                  {" → "}
                  {r.rentalEndDate ? new Date(r.rentalEndDate).toLocaleDateString() : "—"}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                {r.totalDays && (
                  <Text className="text-gray-400 text-xs">{r.totalDays}d</Text>
                )}
                <Text className="text-gray-900 text-xs font-semibold">
                  ৳{r.product?.pricePerDay}/day
                </Text>
              </View>
            </View>

            {/* Payment badges */}
            {(r.paidWithBcc || r.paidWithRcc) && (
              <View className="flex-row gap-2 mt-2">
                {r.paidWithBcc && (
                  <View className="bg-blue-50 px-2 py-0.5 rounded-full">
                    <Text className="text-blue-600 text-[10px] font-medium">BCC {r.usedBccAmount}</Text>
                  </View>
                )}
                {r.paidWithRcc && (
                  <View className="bg-red-50 px-2 py-0.5 rounded-full">
                    <Text className="text-red-500 text-[10px] font-medium">RCC used</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-20">
              <Ionicons name="swap-horizontal-outline" size={36} color="#e5e7eb" />
              <Text className="text-gray-300 text-sm mt-3">No requests found</Text>
            </View>
          ) : null
        }
      />

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#111827" />
        </View>
      )}
    </View>
  );
}
