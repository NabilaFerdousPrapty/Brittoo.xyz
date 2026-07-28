import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { adminGetUserCreditHistory } from "../../hooks/api";

const TX_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  PURCHASE_BCC:    { bg: "bg-green-100",  text: "text-green-700"  },
  RENT_DEPOSIT:    { bg: "bg-blue-100",   text: "text-blue-700"   },
  DEPOSIT_REFUND:  { bg: "bg-violet-100", text: "text-violet-700" },
  MONEY_WITHDRAWAL:{ bg: "bg-red-100",    text: "text-red-700"    },
};

const TX_STATUS_COLORS: Record<string, string> = {
  ACCEPTED: "text-green-600", PENDING: "text-amber-600", REJECTED: "text-red-500",
};

function SummaryCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-3">
      <Text className="text-gray-400 text-xs mb-1">{label}</Text>
      <Text className={`text-base font-bold ${color ?? "text-gray-900"}`}>{value}</Text>
      {sub && <Text className="text-gray-300 text-xs mt-0.5">{sub}</Text>}
    </View>
  );
}

export default function AdminUserCreditsScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]           = useState<"bcc" | "rcc">("bcc");

  const load = async () => {
    try {
      const res = await adminGetUserCreditHistory(userId!);
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { if (userId) load(); }, [userId]);

  if (loading) {
    return <View className="flex-1 bg-white items-center justify-center"><ActivityIndicator size="large" color="#111827" /></View>;
  }

  const s = data?.summary;

  return (
    <View className="flex-1 bg-white">
      <View className="pt-14 px-5 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-1">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-lg font-semibold">Credit History</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#111827" />}
      >
        {/* BCC summary */}
        <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">BCC Wallet</Text>
        <View className="flex-row gap-2 mb-4">
          <SummaryCard label="Available"  value={`${s?.bcc?.availableBalance ?? 0} BCC`} color="text-blue-600" />
          <SummaryCard label="Locked"     value={`${s?.bcc?.lockedBalance ?? 0} BCC`}    color="text-amber-600" />
        </View>
        <View className="flex-row gap-2 mb-5">
          <SummaryCard label="Purchased"  value={`${s?.bcc?.totalPurchased ?? 0} BCC`}   color="text-green-600" />
          <SummaryCard label="Spent"      value={`${s?.bcc?.totalSpent ?? 0} BCC`}        color="text-red-500" />
        </View>

        {/* RCC summary */}
        <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Red Cache Credits</Text>
        <View className="flex-row gap-2 mb-5">
          <SummaryCard label="Total RCC"  value={`৳${s?.rcc?.totalAmount ?? 0}`} />
          <SummaryCard label="In Use"     value={`৳${s?.rcc?.totalInUse ?? 0}`}     color="text-amber-600" />
          <SummaryCard label="Available"  value={`৳${s?.rcc?.availableAmount ?? 0}`} color="text-green-600" />
        </View>

        {/* Tab: BCC txs / RCC credits */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
          {(["bcc", "rcc"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg items-center ${tab === t ? "bg-white" : ""}`}
            >
              <Text className={`text-xs font-semibold ${tab === t ? "text-gray-900" : "text-gray-400"}`}>
                {t === "bcc" ? "BCC Transactions" : "RCC Credits"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BCC Transactions */}
        {tab === "bcc" && (
          <View className="gap-2">
            {(data?.bccTransactions ?? []).length === 0 ? (
              <Text className="text-gray-300 text-sm text-center py-8">No BCC transactions</Text>
            ) : (data?.bccTransactions ?? []).map((tx: any) => {
              const tc = TX_TYPE_COLORS[tx.transactionType] ?? { bg: "bg-gray-100", text: "text-gray-600" };
              return (
                <View key={tx.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className={`px-2 py-0.5 rounded-full ${tc.bg}`}>
                      <Text className={`text-[10px] font-medium ${tc.text}`}>
                        {tx.transactionType.replace(/_/g, " ")}
                      </Text>
                    </View>
                    <Text className={`text-xs font-semibold ${TX_STATUS_COLORS[tx.status] ?? "text-gray-500"}`}>
                      {tx.status}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-900 font-bold text-sm">{tx.amount} BCC</Text>
                    <Text className="text-gray-400 text-xs">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {tx.rejectReason && (
                    <Text className="text-red-400 text-xs mt-1">Reason: {tx.rejectReason}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* RCC Credits */}
        {tab === "rcc" && (
          <View className="gap-2">
            {(data?.redCacheCredits ?? []).length === 0 ? (
              <Text className="text-gray-300 text-sm text-center py-8">No RCC credits</Text>
            ) : (data?.redCacheCredits ?? []).map((rcc: any) => (
              <View key={rcc.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                    {rcc.sourceProduct?.name ?? "—"}
                  </Text>
                  <Text className="text-gray-400 text-xs font-mono">{rcc.sourceProduct?.productSL}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row gap-3">
                    <Text className="text-gray-700 text-sm">Total: <Text className="font-bold">৳{rcc.amount}</Text></Text>
                    <Text className="text-amber-600 text-sm">Used: <Text className="font-bold">৳{rcc.inUse}</Text></Text>
                  </View>
                  <Text className="text-green-600 text-sm font-bold">৳{rcc.amount - rcc.inUse} free</Text>
                </View>
                {rcc.isFrozen && (
                  <View className="mt-1.5 flex-row items-center gap-1">
                    <Ionicons name="snow-outline" size={11} color="#60a5fa" />
                    <Text className="text-blue-400 text-xs">Frozen</Text>
                  </View>
                )}
                <Text className="text-gray-300 text-xs mt-1">
                  {new Date(rcc.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
