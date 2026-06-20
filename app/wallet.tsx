import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BACKEND_URL,
  getUserCreditHistoryDash,
  UserCreditHistoryDashResponse,
} from "../hooks/api";

const TX_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  RENT_DEPOSIT: { bg: "bg-blue-50", text: "text-blue-600" },
  DEPOSIT_REFUND: { bg: "bg-violet-50", text: "text-violet-600" },
  BONUS_CREDIT: { bg: "bg-emerald-50", text: "text-emerald-600" },
  PURCHASE_BCC: { bg: "bg-emerald-50", text: "text-emerald-600" },
  MONEY_WITHDRAWAL: { bg: "bg-red-50", text: "text-red-500" },
  ADJUSTMENT: { bg: "bg-gray-100", text: "text-gray-500" },
};

const TX_STATUS_COLORS: Record<string, string> = {
  ACCEPTED: "text-emerald-600",
  PENDING: "text-amber-600",
  REJECTED: "text-red-500",
};

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-3">
      <Text className="text-gray-400 text-xs mb-1">{label}</Text>
      <Text className={`text-base font-extrabold ${color ?? "text-gray-900"}`}>
        {value}
      </Text>
    </View>
  );
}

type TabId = "bcc" | "rcc" | "rentals";

export default function WalletScreen() {
  const [data, setData] = useState<
    UserCreditHistoryDashResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<TabId>("bcc");

  const load = useCallback(async () => {
    try {
      const res = await getUserCreditHistoryDash();
      setData(res.data.data);
    } catch (e) {
      console.error("Credit history error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={40} color="#e5e7eb" />
        <Text className="text-gray-400 text-sm mt-3">
          Couldn't load wallet data
        </Text>
        <TouchableOpacity
          onPress={load}
          className="mt-4 bg-emerald-500 rounded-full px-5 py-2.5"
        >
          <Text className="text-white text-sm font-semibold">Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { summary, bccTransactions, redCacheCredits, rentalHistory } = data;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-2 pb-3 border-b border-gray-100 flex-row items-center gap-3 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-lg font-bold">
          Wallet & Credits
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor="#10b981"
          />
        }
      >
        {/* BCC summary */}
        <Text className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">
          Blue Credit Wallet
        </Text>
        <View className="flex-row gap-2 mb-2">
          <SummaryCard
            label="Available"
            value={`${summary.bcc.availableBalance ?? 0} BCC`}
            color="text-blue-600"
          />
          <SummaryCard
            label="Locked"
            value={`${summary.bcc.lockedBalance ?? 0} BCC`}
            color="text-amber-600"
          />
        </View>
        <View className="flex-row gap-2 mb-2">
          <SummaryCard
            label="Purchased"
            value={`${summary.bcc.totalPurchased ?? 0} BCC`}
            color="text-emerald-600"
          />
          <SummaryCard
            label="Spent"
            value={`${summary.bcc.totalSpent ?? 0} BCC`}
            color="text-red-500"
          />
        </View>
        {summary.bcc.totalPendingBcc > 0 && (
          <View className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-2 flex-row items-center gap-2">
            <Ionicons name="time-outline" size={14} color="#d97706" />
            <Text className="text-amber-700 text-xs flex-1">
              {summary.bcc.totalPendingBcc} BCC pending approval (
              {summary.bcc.pendingBccRequests.length} requests)
            </Text>
          </View>
        )}

        {/* RCC summary */}
        <Text className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3 mt-3">
          Red Cache Credits
        </Text>
        <View className="flex-row gap-2 mb-5">
          <SummaryCard label="Total" value={`${summary.rcc.totalAmount} CC`} />
          <SummaryCard
            label="In Use"
            value={`${summary.rcc.totalInUse} CC`}
            color="text-amber-600"
          />
          <SummaryCard
            label="Available"
            value={`${summary.rcc.availableAmount} CC`}
            color="text-emerald-600"
          />
        </View>

        {/* Rentals strip */}
        <View className="flex-row gap-2 mb-5">
          <SummaryCard
            label="Total Rentals"
            value={summary.rentals.totalRentals}
          />
          <SummaryCard
            label="Completed"
            value={summary.rentals.completedRentals}
            color="text-emerald-600"
          />
          <SummaryCard
            label="Total Spent"
            value={`${summary.rentals.totalValue} BCC`}
            color="text-red-500"
          />
        </View>

        {/* Tabs */}
        <View className="flex-row bg-gray-100 rounded-full p-1 mb-4">
          {(
            [
              { id: "bcc", label: "Transactions" },
              { id: "rcc", label: "RCC Credits" },
              { id: "rentals", label: "Rentals" },
            ] as { id: TabId; label: string }[]
          ).map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-full items-center ${tab === t.id ? "bg-white shadow-sm" : ""}`}
            >
              <Text
                className={`text-xs font-semibold ${tab === t.id ? "text-emerald-600" : "text-gray-400"}`}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BCC Transactions */}
        {tab === "bcc" && (
          <View className="gap-2">
            {bccTransactions.length === 0 ? (
              <Text className="text-gray-300 text-sm text-center py-8">
                No transactions yet
              </Text>
            ) : (
              bccTransactions.map((tx) => {
                const tc = TX_TYPE_COLORS[tx.transactionType] ?? {
                  bg: "bg-gray-100",
                  text: "text-gray-600",
                };
                return (
                  <View
                    key={tx.id}
                    className="bg-gray-50 border border-gray-100 rounded-2xl p-3"
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <View className={`px-2 py-0.5 rounded-full ${tc.bg}`}>
                        <Text
                          className={`text-[10px] font-semibold ${tc.text}`}
                        >
                          {tx.transactionType.replace(/_/g, " ")}
                        </Text>
                      </View>
                      <Text
                        className={`text-xs font-semibold ${TX_STATUS_COLORS[tx.status] ?? "text-gray-500"}`}
                      >
                        {tx.status}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-900 font-extrabold text-sm">
                        {tx.amount} BCC
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {tx.paymentGateway && (
                      <Text className="text-gray-400 text-xs mt-1">
                        Via {tx.paymentGateway}
                      </Text>
                    )}
                    {tx.rejectReason && (
                      <Text className="text-red-400 text-xs mt-1">
                        Reason: {tx.rejectReason}
                      </Text>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* RCC Credits */}
        {tab === "rcc" && (
          <View className="gap-2">
            {redCacheCredits.length === 0 ? (
              <Text className="text-gray-300 text-sm text-center py-8">
                No RCC credits yet
              </Text>
            ) : (
              redCacheCredits.map((rcc) => {
                const imgUrl = rcc.sourceProduct?.optimizedImages?.[0]
                  ? `${BACKEND_URL}${rcc.sourceProduct.optimizedImages[0]}`
                  : null;
                return (
                  <TouchableOpacity
                    key={rcc.id}
                    onPress={() =>
                      rcc.sourceProduct?.id &&
                      router.push({
                        pathname: "/(products)/[id]" as any,
                        params: { id: rcc.sourceProduct.id },
                      })
                    }
                    activeOpacity={0.85}
                    className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex-row gap-3"
                  >
                    <View className="w-12 h-12 bg-emerald-50 rounded-xl overflow-hidden items-center justify-center">
                      {imgUrl ? (
                        <Image
                          source={{ uri: imgUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name="cube-outline"
                          size={18}
                          color="#10b981"
                        />
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-gray-900 font-semibold text-sm flex-1 pr-2"
                          numberOfLines={1}
                        >
                          {rcc.sourceProduct?.name ?? "—"}
                        </Text>
                        <Text className="text-gray-400 text-[10px] font-mono">
                          {rcc.sourceProduct?.productSL}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-3 mt-1">
                        <Text className="text-gray-700 text-xs">
                          Total:{" "}
                          <Text className="font-bold">{rcc.amount} CC</Text>
                        </Text>
                        <Text className="text-amber-600 text-xs">
                          Used:{" "}
                          <Text className="font-bold">{rcc.inUse} CC</Text>
                        </Text>
                        <Text className="text-emerald-600 text-xs font-bold">
                          {rcc.amount - rcc.inUse} free
                        </Text>
                      </View>
                      {rcc.isFrozen && (
                        <View className="flex-row items-center gap-1 mt-1">
                          <Ionicons
                            name="snow-outline"
                            size={11}
                            color="#60a5fa"
                          />
                          <Text className="text-blue-400 text-xs">Frozen</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Rental History */}
        {tab === "rentals" && (
          <View className="gap-2">
            {rentalHistory.length === 0 ? (
              <Text className="text-gray-300 text-sm text-center py-8">
                No rental history yet
              </Text>
            ) : (
              rentalHistory.map((r) => {
                const imgUrl = r.product?.optimizedImages?.[0]
                  ? `${BACKEND_URL}${r.product.optimizedImages[0]}`
                  : null;
                return (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() =>
                      router.push({
                        pathname: "/(products)/[id]" as any,
                        params: { id: r.product.id },
                      })
                    }
                    activeOpacity={0.85}
                    className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex-row gap-3"
                  >
                    <View className="w-12 h-12 bg-emerald-50 rounded-xl overflow-hidden items-center justify-center">
                      {imgUrl ? (
                        <Image
                          source={{ uri: imgUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name="cube-outline"
                          size={18}
                          color="#10b981"
                        />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-gray-900 font-semibold text-sm"
                        numberOfLines={1}
                      >
                        {r.product?.name ?? "—"}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-0.5">
                        {r.status.replace(/_/g, " ")}
                      </Text>
                      {r.usedBccAmount != null && (
                        <Text className="text-gray-700 text-xs mt-0.5">
                          Used: {r.usedBccAmount} BCC
                        </Text>
                      )}
                      {r.rccUsageDetails?.length > 0 && (
                        <Text className="text-red-400 text-xs mt-0.5">
                          RCC:{" "}
                          {r.rccUsageDetails.reduce(
                            (s, u) => s + u.usedAmount,
                            0,
                          )}{" "}
                          CC
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
