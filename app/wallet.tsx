import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/button";
import {
  getUserCreditHistoryDash,
  type UserCreditHistoryDashResponse,
} from "../hooks/api";

type WalletData = UserCreditHistoryDashResponse["data"];

const TABS = ["Overview", "Credits", "Transactions", "History"] as const;
type Tab = (typeof TABS)[number];

const statusStyle: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700" },
  ACCEPTED: { bg: "bg-green-50", text: "text-green-700" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700" },
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

export default function WalletScreen() {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getUserCreditHistoryDash();
      if (res.data?.data) setData(res.data.data);
    } catch (e) {
      console.error("Failed to load wallet data:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400 text-sm">Loading wallet...</Text>
      </View>
    );
  }

  const bcc = data?.summary.bcc;
  const rcc = data?.summary.rcc;
  const rentals = data?.summary.rentals;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <SafeAreaView edges={["top"]} className="bg-emerald-600">
        <View className="flex-row items-center px-4 pt-2 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-lg ml-3">
            Wallet
          </Text>
        </View>

        {/* Balance */}
        <View className="px-6 pb-6">
          <Text className="text-emerald-100 text-xs">Available balance</Text>
          <Text className="text-white font-bold text-3xl mt-1">
            {bcc?.availableBalance ?? 0} BCC
          </Text>
          {!!bcc?.lockedBalance && (
            <Text className="text-emerald-100 text-xs mt-1">
              {bcc.lockedBalance} BCC locked in active rentals
            </Text>
          )}
        </View>
      </SafeAreaView>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-100 px-2">
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className="flex-1 items-center py-3"
          >
            <Text
              className={`text-xs font-medium ${tab === t ? "text-emerald-600" : "text-gray-400"}`}
            >
              {t}
            </Text>
            {tab === t && (
              <View className="h-0.5 w-8 bg-emerald-600 rounded-full mt-1" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor="#10b981"
          />
        }
      >
        {/* ─── Overview ─────────────────────────────────────────────── */}
        {tab === "Overview" && (
          <>
            <Button
              label="Buy BCC"
              onPress={() => router.push("/buy-bcc")}
              size="lg"
              className="mb-4"
            />

            <View className="flex-row flex-wrap gap-3 mb-4">
              {[
                {
                  label: "Total purchased",
                  value: `${bcc?.totalPurchased ?? 0} BCC`,
                  icon: "arrow-down-circle-outline",
                  color: "#10b981",
                },
                {
                  label: "Total spent",
                  value: `${bcc?.totalSpent ?? 0} BCC`,
                  icon: "arrow-up-circle-outline",
                  color: "#ef4444",
                },
                {
                  label: "RCC available",
                  value: `${rcc?.availableAmount ?? 0}`,
                  icon: "pricetag-outline",
                  color: "#d97706",
                },
                {
                  label: "Completed rentals",
                  value: `${rentals?.completedRentals ?? 0}`,
                  icon: "checkmark-done-outline",
                  color: "#7c3aed",
                },
              ].map((stat) => (
                <View
                  key={stat.label}
                  className="bg-white border border-gray-100 rounded-2xl p-4"
                  style={{ width: "47%" }}
                >
                  <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                  <Text className="text-gray-400 text-xs mt-2">
                    {stat.label}
                  </Text>
                  <Text
                    style={{ color: stat.color }}
                    className="font-semibold text-base mt-0.5"
                  >
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>

            {!!bcc?.pendingBccRequests?.length && (
              <View className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
                <Text className="text-amber-800 font-medium text-sm">
                  {bcc.pendingBccRequests.length} pending BCC purchase
                  {bcc.pendingBccRequests.length > 1 ? "s" : ""}
                </Text>
                <Text className="text-amber-700 text-xs mt-1">
                  Total pending: {bcc.totalPendingBcc} BCC
                </Text>
              </View>
            )}

            <View className="bg-white border border-gray-100 rounded-2xl p-4">
              <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
                Rental summary
              </Text>
              <View className="flex-row justify-between py-2 border-b border-gray-50">
                <Text className="text-gray-500 text-sm">Total rentals</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {rentals?.totalRentals ?? 0}
                </Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-gray-50">
                <Text className="text-gray-500 text-sm">Total value</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {rentals?.totalValue ?? 0} BCC
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-500 text-sm">Average value</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {(rentals?.averageRentalValue ?? 0).toFixed(1)} BCC
                </Text>
              </View>
            </View>
          </>
        )}

        {/* ─── RCC Credits ──────────────────────────────────────────── */}
        {tab === "Credits" && (
          <>
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white border border-gray-100 rounded-2xl p-4">
                <Text className="text-gray-400 text-xs">Total</Text>
                <Text className="text-gray-900 font-semibold text-lg mt-0.5">
                  {rcc?.totalAmount ?? 0}
                </Text>
              </View>
              <View className="flex-1 bg-white border border-gray-100 rounded-2xl p-4">
                <Text className="text-gray-400 text-xs">In use</Text>
                <Text className="text-amber-600 font-semibold text-lg mt-0.5">
                  {rcc?.totalInUse ?? 0}
                </Text>
              </View>
              <View className="flex-1 bg-white border border-gray-100 rounded-2xl p-4">
                <Text className="text-gray-400 text-xs">Available</Text>
                <Text className="text-emerald-600 font-semibold text-lg mt-0.5">
                  {rcc?.availableAmount ?? 0}
                </Text>
              </View>
            </View>

            {data?.redCacheCredits.length === 0 && (
              <Text className="text-gray-400 text-sm text-center mt-10">
                No RCC credits yet.
              </Text>
            )}

            {data?.redCacheCredits.map((credit) => (
              <View
                key={credit.id}
                className="flex-row items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 mb-3"
              >
                <Image
                  source={{
                    uri: credit.sourceProduct.optimizedImages?.[0],
                  }}
                  className="w-12 h-12 rounded-xl bg-gray-100"
                />
                <View className="flex-1">
                  <Text className="text-gray-900 text-sm font-medium">
                    {credit.sourceProduct.name}
                  </Text>
                  <Text className="text-gray-400 text-[11px] mt-0.5">
                    {credit.amount} credits · {credit.inUse} in use
                  </Text>
                </View>
                {credit.isFrozen && (
                  <View className="bg-red-50 px-2 py-1 rounded-full">
                    <Text className="text-red-600 text-[10px] font-medium">
                      Frozen
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* ─── Transactions ─────────────────────────────────────────── */}
        {tab === "Transactions" && (
          <>
            {data?.bccTransactions.length === 0 && (
              <Text className="text-gray-400 text-sm text-center mt-10">
                No transactions yet.
              </Text>
            )}
            {data?.bccTransactions.map((tx, i, arr) => {
              const style = statusStyle[tx.status] ?? statusStyle.PENDING;
              return (
                <View
                  key={tx.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-900 text-sm font-medium">
                      {formatLabel(tx.transactionType)}
                    </Text>
                    <View className={`px-2 py-0.5 rounded-full ${style.bg}`}>
                      <Text className={`text-[10px] font-medium ${style.text}`}>
                        {formatLabel(tx.status)}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-900 font-semibold text-base mt-1">
                    {tx.amount} BCC
                  </Text>
                  <Text className="text-gray-400 text-[11px] mt-1">
                    {timeAgo(tx.createdAt)}
                    {tx.paymentGateway ? ` · ${tx.paymentGateway}` : ""}
                  </Text>
                  {tx.status === "REJECTED" && tx.rejectReason && (
                    <Text className="text-red-500 text-[11px] mt-1">
                      {tx.rejectReason}
                    </Text>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* ─── Rental history ───────────────────────────────────────── */}
        {tab === "History" && (
          <>
            {data?.rentalHistory.length === 0 && (
              <Text className="text-gray-400 text-sm text-center mt-10">
                No rental history yet.
              </Text>
            )}
            {data?.rentalHistory.map((rental) => (
              <View
                key={rental.id}
                className="flex-row items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 mb-3"
              >
                <Image
                  source={{ uri: rental.product.optimizedImages?.[0] }}
                  className="w-12 h-12 rounded-xl bg-gray-100"
                />
                <View className="flex-1">
                  <Text className="text-gray-900 text-sm font-medium">
                    {rental.product.name}
                  </Text>
                  <Text className="text-gray-400 text-[11px] mt-0.5">
                    {formatLabel(rental.status)}
                    {rental.usedBccAmount
                      ? ` · ${rental.usedBccAmount} BCC`
                      : ""}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}