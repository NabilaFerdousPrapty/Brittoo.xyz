import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  adminGetUserDetails, adminVerifyUser, adminSuspendUser,
} from "../../hooks/api";
import { useAdminGuard } from "../../hooks/useAdminGuard";
import { Button } from "../../components/button";
import { API_BASE_URL } from "../../constants";

const BASE = API_BASE_URL.replace("/api", "");

const TABS = [
  { id: "overview",   label: "Overview",   icon: "person-outline"         },
  { id: "documents",  label: "Documents",  icon: "document-text-outline"  },
  { id: "security",   label: "Security",   icon: "shield-outline"         },
  { id: "wallet",     label: "Wallet",     icon: "wallet-outline"         },
  { id: "rentals",    label: "Rentals",    icon: "swap-horizontal-outline" },
] as const;
type TabId = typeof TABS[number]["id"];

const SCORE_COLORS: Record<string, string> = {
  VERY_HIGH: "#16a34a", HIGH: "#22c55e", MID: "#d97706", LOW: "#f97316", VERY_LOW: "#dc2626",
};
const SCORE_PCT: Record<string, number> = {
  VERY_HIGH: 100, HIGH: 80, MID: 60, LOW: 40, VERY_LOW: 20,
};

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View className="flex-row items-center justify-between py-2.5 border-b border-gray-50">
      <Text className="text-gray-400 text-sm">{label}</Text>
      <Text className="text-sm font-medium" style={{ color: valueColor ?? "#111827" }}>{value}</Text>
    </View>
  );
}

function CheckRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <View className="flex-row items-center justify-between py-2.5">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Ionicons
        name={ok ? "checkmark-circle" : "close-circle"}
        size={18}
        color={ok ? "#16a34a" : "#dc2626"}
      />
    </View>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-3 items-center gap-1">
      <Ionicons name={icon} size={20} color={color} />
      <Text className="text-gray-900 text-base font-bold">{value}</Text>
      <Text className="text-gray-400 text-xs text-center">{label}</Text>
    </View>
  );
}

export default function AdminUserDetailScreen() {
  const { ready } = useAdminGuard();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [acting, setActing]     = useState(false);

  useEffect(() => { if (ready && userId) load(); }, [ready, userId]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetUserDetails(userId!);
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleVerify = () => {
    Alert.alert("Verify User", `Verify ${data?.user?.name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Verify", onPress: async () => {
        setActing(true);
        try { await adminVerifyUser(userId!); await load(); }
        catch (e: any) { Alert.alert("Error", e?.response?.data?.message || "Failed"); }
        finally { setActing(false); }
      }},
    ]);
  };

  const handleSuspend = () => {
    Alert.alert("Suspend User", `Suspend ${data?.user?.name}? This will increment their suspension count.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Suspend", style: "destructive", onPress: async () => {
        setActing(true);
        try { await adminSuspendUser(userId!); await load(); }
        catch (e: any) { Alert.alert("Error", e?.response?.data?.message || "Failed"); }
        finally { setActing(false); }
      }},
    ]);
  };

  if (!ready || loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={40} color="#e5e7eb" />
        <Text className="text-gray-400 text-sm mt-3">User not found</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-gray-900 font-medium text-sm">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { user, walletSummary, creditSummary, locationInfo, documentStatus, stats, rentalStats } = data;
  const scorePct = SCORE_PCT[user.securityScore] ?? 20;
  const scoreColor = SCORE_COLORS[user.securityScore] ?? "#6b7280";
  const initials = user.name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 px-5 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-500 text-xs font-mono">{user.roll}</Text>
          <View className="w-6" />
        </View>

        {/* User header card */}
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-12 h-12 bg-gray-900 rounded-2xl items-center justify-center">
            <Text className="text-white font-semibold">{initials}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-gray-900 text-lg font-semibold">{user.name}</Text>
              {user.brittooVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
              )}
            </View>
            <Text className="text-gray-400 text-xs mt-0.5">{user.email}</Text>
          </View>
          {/* Verification badge */}
          <View className={`px-2.5 py-1 rounded-full ${
            user.isVerified === "VERIFIED" ? "bg-green-100" :
            user.isVerified === "PENDING"  ? "bg-amber-100" : "bg-gray-100"
          }`}>
            <Text className={`text-xs font-semibold ${
              user.isVerified === "VERIFIED" ? "text-green-700" :
              user.isVerified === "PENDING"  ? "text-amber-700" : "text-gray-500"
            }`}>{user.isVerified}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-2">
          {user.isVerified !== "VERIFIED" && (
            <TouchableOpacity
              onPress={handleVerify}
              disabled={acting}
              className="flex-1 flex-row items-center justify-center gap-1.5 bg-green-600 rounded-xl py-2.5"
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={15} color="#fff" />
              <Text className="text-white text-xs font-semibold">Verify User</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSuspend}
            disabled={acting}
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-red-500 rounded-xl py-2.5"
            activeOpacity={0.85}
          >
            <Ionicons name="ban-outline" size={15} color="#fff" />
            <Text className="text-white text-xs font-semibold">
              {user.isSuspended ? `Suspend Again (${user.suspensionCount})` : "Suspend"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick stats */}
      <View className="flex-row gap-2 px-5 py-3">
        <StatCard label="BCC Balance"    value={walletSummary?.totalBalance ?? 0}     icon="wallet-outline"    color="#2563eb" />
        <StatCard label="Red Credits"    value={creditSummary?.availableRedCredits ?? 0} icon="card-outline"   color="#dc2626" />
        <StatCard label="Products Out"   value={stats?.totalProductsRented ?? 0}       icon="cube-outline"     color="#7c3aed" />
        <StatCard label="Security"       value={`${scorePct}%`}                         icon="shield-outline"  color={scoreColor} />
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-gray-100">
        <View className="flex-row px-5">
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              className={`flex-row items-center gap-1.5 px-1 py-3 mr-5 border-b-2 ${
                activeTab === t.id ? "border-gray-900" : "border-transparent"
              }`}
            >
              <Ionicons
                name={t.icon as any}
                size={14}
                color={activeTab === t.id ? "#111827" : "#9ca3af"}
              />
              <Text className={`text-xs font-medium ${activeTab === t.id ? "text-gray-900" : "text-gray-400"}`}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Tab content */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <View className="gap-4">
            <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Account Info</Text>
              <Row label="Role"              value={user.role} />
              <Row label="Email Verified"    value={user.emailVerified ? "Yes" : "No"}    valueColor={user.emailVerified ? "#16a34a" : "#dc2626"} />
              <Row label="University Mail"   value={user.isValidRuetMail ? "Valid" : "Invalid"} valueColor={user.isValidRuetMail ? "#16a34a" : "#dc2626"} />
              <Row label="Brittoo Verified"  value={user.brittooVerified ? "Yes" : "No"}  valueColor={user.brittooVerified ? "#2563eb" : "#9ca3af"} />
              <Row label="Suspension Count"  value={`${user.suspensionCount}`}            valueColor={user.suspensionCount > 0 ? "#dc2626" : "#16a34a"} />
              <Row label="Joined"            value={new Date(user.createdAt).toLocaleDateString()} />
            </View>

            <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Location & Network</Text>
              <Row label="IP Address"  value={user.ipAddress  ?? "N/A"} />
              <Row label="Latitude"   value={user.latitude   ? `${user.latitude}` : "N/A"} />
              <Row label="Longitude"  value={user.longitude  ? `${user.longitude}` : "N/A"} />
              {locationInfo?.hasLocation && (
                <TouchableOpacity
                  className="mt-3 flex-row items-center gap-1"
                  onPress={() => {/* open maps deep link */}}
                >
                  <Ionicons name="map-outline" size={14} color="#2563eb" />
                  <Text className="text-blue-600 text-xs font-medium">View on Maps</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── DOCUMENTS ── */}
        {activeTab === "documents" && (
          <View className="gap-4">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 font-semibold text-base">Document Verification</Text>
              <View className={`px-2.5 py-1 rounded-full ${documentStatus?.documentsComplete ? "bg-green-100" : "bg-amber-100"}`}>
                <Text className={`text-xs font-medium ${documentStatus?.documentsComplete ? "text-green-700" : "text-amber-700"}`}>
                  {documentStatus?.documentsComplete ? "Complete" : "Incomplete"}
                </Text>
              </View>
            </View>

            {[
              { label: "Selfie",        has: documentStatus?.hasSelfie,      src: user.selfie      },
              { label: "ID Card Front", has: documentStatus?.hasIdCardFront,  src: user.idCardFront },
              { label: "ID Card Back",  has: documentStatus?.hasIdCardBack,   src: user.idCardBack  },
            ].map((doc) => (
              <View key={doc.label} className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-gray-700 font-medium text-sm">{doc.label}</Text>
                  <Ionicons
                    name={doc.has ? "checkmark-circle" : "close-circle"}
                    size={18}
                    color={doc.has ? "#16a34a" : "#dc2626"}
                  />
                </View>
                {doc.has && doc.src && (
                  <Image
                    source={{ uri: `${BASE}${doc.src}` }}
                    style={{ width: "100%", height: 200 }}
                    resizeMode="cover"
                  />
                )}
                {!doc.has && (
                  <View className="h-20 items-center justify-center">
                    <Text className="text-gray-300 text-sm">Not uploaded</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── SECURITY ── */}
        {activeTab === "security" && (
          <View className="gap-4">
            {/* Score bar */}
            <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-900 font-semibold text-sm">Security Score</Text>
                <Text className="font-bold text-base" style={{ color: scoreColor }}>
                  {scorePct}%{" "}
                  <Text className="text-gray-400 text-xs font-normal">({user.securityScore})</Text>
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-2 rounded-full"
                  style={{ width: `${scorePct}%`, backgroundColor: scoreColor }}
                />
              </View>
            </View>

            <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Verification Checks</Text>
              <CheckRow label="Selfie uploaded"    ok={!!documentStatus?.hasSelfie} />
              <CheckRow label="ID card front"      ok={!!documentStatus?.hasIdCardFront} />
              <CheckRow label="ID card back"       ok={!!documentStatus?.hasIdCardBack} />
              <CheckRow label="Location available" ok={!!locationInfo?.hasLocation} />
              <CheckRow label="Email verified"     ok={!!user.emailVerified} />
              <CheckRow label="University email"   ok={!!user.isValidRuetMail} />
              <CheckRow label="Brittoo verified"   ok={!!user.brittooVerified} />
            </View>

            {user.isSuspended && (
              <View className="bg-red-50 border border-red-100 rounded-2xl p-4 flex-row items-start gap-2">
                <Ionicons name="warning-outline" size={16} color="#dc2626" style={{ marginTop: 1 }} />
                <View>
                  <Text className="text-red-700 font-semibold text-sm">Account Suspended</Text>
                  <Text className="text-red-500 text-xs mt-0.5">
                    Suspension count: {user.suspensionCount} — user cannot perform rental operations
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── WALLET ── */}
        {activeTab === "wallet" && (
          <View className="gap-4">
            <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">BCC Wallet</Text>
              <Row label="Available Balance" value={`${walletSummary?.availableBalance ?? 0} BCC`} valueColor="#2563eb" />
              <Row label="Locked Balance"    value={`${walletSummary?.lockedBalance ?? 0} BCC`}    valueColor="#d97706" />
              <Row label="Total Balance"     value={`${walletSummary?.totalBalance ?? 0} BCC`} />
            </View>

            <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Red Cache Credits (RCC)</Text>
              <Row label="Total RCC"      value={`৳${creditSummary?.totalRedCredits ?? 0}`} />
              <Row label="In Use"         value={`৳${creditSummary?.totalRedCreditsInUse ?? 0}`} valueColor="#d97706" />
              <Row label="Available RCC"  value={`৳${creditSummary?.availableRedCredits ?? 0}`} valueColor="#16a34a" />
            </View>

            {/* View full credit history */}
            <Button
              label="View Full Credit History"
              onPress={() => router.push({ pathname: "/(admin)/user-credits", params: { userId: user.id } })}
              variant="secondary"
              size="md"
            />
          </View>
        )}

        {/* ── RENTALS ── */}
        {activeTab === "rentals" && (
          <View className="gap-4">
            <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Rental Statistics</Text>
              <Row label="Total Requests Made"     value={`${stats?.totalRequestsMade ?? 0}`} />
              <Row label="Total Requests Received" value={`${stats?.totalRequestsReceived ?? 0}`} />
              <Row label="Completed Rentals"       value={`${rentalStats?.totalRentalsCompleted ?? 0}`} valueColor="#16a34a" />
              <Row label="Active Rentals"          value={`${rentalStats?.totalRentalsActive ?? 0}`}    valueColor="#2563eb" />
              <Row label="Cancelled"               value={`${rentalStats?.totalRentalsCancelled ?? 0}`} valueColor="#dc2626" />
              <Row label="Total Earnings"          value={`৳${rentalStats?.totalEarnings ?? 0}`}        valueColor="#16a34a" />
              <Row label="Total Spent"             value={`৳${rentalStats?.totalSpent ?? 0}`}           valueColor="#dc2626" />
            </View>

            <View className="flex-row gap-3">
              <Button
                label="Placed Requests"
                onPress={() => router.push({ pathname: "/(admin)/user-requests", params: { userId: user.id, type: "placed" } })}
                variant="secondary"
                size="md"
                className="flex-1"
              />
              <Button
                label="Received Requests"
                onPress={() => router.push({ pathname: "/(admin)/user-requests", params: { userId: user.id, type: "received" } })}
                variant="secondary"
                size="md"
                className="flex-1"
              />
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
