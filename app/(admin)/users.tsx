import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { adminGetUsers } from "../../hooks/api";
import { useAdminGuard } from "../../hooks/useAdminGuard";

const STATUS_FILTERS = ["ALL","VERIFIED","PENDING","UNVERIFIED","SUSPENDED"] as const;
type Status = typeof STATUS_FILTERS[number];

const STATUS_COLORS: Record<Status, { bg: string; text: string }> = {
  ALL:        { bg: "bg-gray-100",   text: "text-gray-700"  },
  VERIFIED:   { bg: "bg-green-100",  text: "text-green-700" },
  PENDING:    { bg: "bg-amber-100",  text: "text-amber-700" },
  UNVERIFIED: { bg: "bg-gray-100",   text: "text-gray-500"  },
  SUSPENDED:  { bg: "bg-red-100",    text: "text-red-700"   },
};

const SCORE_COLORS: Record<string, string> = {
  VERY_HIGH: "text-green-600", HIGH: "text-green-500",
  MID: "text-amber-500", LOW: "text-orange-500", VERY_LOW: "text-red-500",
};

export default function AdminUsersScreen() {
  const { ready } = useAdminGuard();
  const [users, setUsers]           = useState<any[]>([]);
  const [summary, setSummary]       = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState<Status>("ALL");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const fetchUsers = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    setLoading(true);
    try {
      const res = await adminGetUsers({ search, status, page: p, limit: 15 });
      const { users: u, pagination, summary: s } = res.data.data;
      setUsers(reset ? u : (prev) => [...prev, ...u]);
      setTotalPages(pagination.totalPages);
      setSummary(s);
      if (!reset) setPage((x) => x + 1); else setPage(2);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, status, page]);

  useEffect(() => {
    if (!ready) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchUsers(true), 350);
  }, [search, status, ready]);

  if (!ready) return null;

  const StatusPill = ({ s }: { s: Status }) => {
    const active = s === status;
    const { bg, text } = STATUS_COLORS[s];
    return (
      <TouchableOpacity
        onPress={() => { setStatus(s); setPage(1); }}
        className={`px-3 py-1.5 rounded-full border mr-2 ${active ? "bg-gray-900 border-gray-900" : `${bg} border-transparent`}`}
      >
        <Text className={`text-xs font-medium ${active ? "text-white" : text}`}>{s}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 px-5 pb-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-lg font-semibold">Manage Users</Text>
          <View className="w-6" />
        </View>

        {/* Summary pills */}
        {summary && (
          <View className="flex-row flex-wrap gap-2 mb-3">
            {[
              { label: "Total",      val: summary.totalUsers,    color: "bg-gray-100 text-gray-700" },
              { label: "Verified",   val: summary.verified,      color: "bg-green-100 text-green-700" },
              { label: "Pending",    val: summary.pending,       color: "bg-amber-100 text-amber-700" },
              { label: "Suspended",  val: summary.suspended,     color: "bg-red-100 text-red-700" },
            ].map((s) => (
              <View key={s.label} className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${s.color}`}>
                <Text className="text-xs font-semibold">{s.val}</Text>
                <Text className="text-xs">{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Search */}
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 mb-3">
          <Ionicons name="search-outline" size={15} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 py-2.5 text-sm text-gray-900"
            placeholder="Search name, email, roll..."
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

        {/* Status filter */}
        <View className="flex-row">
          {STATUS_FILTERS.map((s) => <StatusPill key={s} s={s} />)}
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchUsers(true); }}
            tintColor="#111827"
          />
        }
        onEndReached={() => { if (!loading && page <= totalPages) fetchUsers(); }}
        onEndReachedThreshold={0.4}
        renderItem={({ item: u }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/(admin)/user-detail", params: { userId: u.id } })}
            className="mx-4 my-1.5 bg-white border border-gray-100 rounded-2xl p-4"
            style={{ elevation: 1, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center gap-3">
              {/* Avatar */}
              <View className="w-10 h-10 bg-gray-900 rounded-xl items-center justify-center">
                <Text className="text-white text-sm font-semibold">
                  {u.name?.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                    {u.name}
                  </Text>
                  {u.brittooVerified && (
                    <Ionicons name="checkmark-circle" size={13} color="#2563eb" />
                  )}
                </View>
                <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>{u.email}</Text>
                <Text className="text-gray-300 text-xs font-mono">{u.roll}</Text>
              </View>

              <View className="items-end gap-1">
                {/* Verification badge */}
                <View className={`px-2 py-0.5 rounded-full ${
                  u.isVerified === "VERIFIED"   ? "bg-green-100" :
                  u.isVerified === "PENDING"    ? "bg-amber-100" : "bg-gray-100"
                }`}>
                  <Text className={`text-xs font-medium ${
                    u.isVerified === "VERIFIED"   ? "text-green-700" :
                    u.isVerified === "PENDING"    ? "text-amber-700" : "text-gray-500"
                  }`}>{u.isVerified}</Text>
                </View>
                {/* Security score */}
                <Text className={`text-xs font-medium ${SCORE_COLORS[u.securityScore] ?? "text-gray-400"}`}>
                  {u.securityScore}
                </Text>
                {u.isSuspended && (
                  <View className="bg-red-100 px-2 py-0.5 rounded-full">
                    <Text className="text-red-600 text-xs font-medium">Suspended</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-20">
              <Ionicons name="people-outline" size={36} color="#e5e7eb" />
              <Text className="text-gray-300 text-sm mt-3">No users found</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && users.length > 0
            ? <View className="py-6 items-center"><ActivityIndicator size="small" color="#6b7280" /></View>
            : null
        }
      />

      {loading && users.length === 0 && (
        <View className="absolute inset-0 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#111827" />
        </View>
      )}
    </View>
  );
}
