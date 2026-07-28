import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
  Modal, ScrollView, Alert, Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getProducts, adminHoldProduct, adminUpdateProduct } from "../../hooks/api";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { API_BASE_URL } from "../../constants";

const BASE = API_BASE_URL.replace("/api", "");

const CONDITION_COLORS: Record<string, string> = {
  NEW: "#16a34a", LIKE_NEW: "#2563eb", GOOD: "#7c3aed", FAIR: "#d97706", POOR: "#dc2626",
};

export default function AdminProductsScreen() {
  const [products, setProducts]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [productType, setType]      = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected]     = useState<any>(null);
  const [modal, setModal]           = useState(false);
  const [acting, setActing]         = useState(false);

  // Edit form state
  const [editName, setEditName]   = useState("");
  const [editScale, setEditScale] = useState("");
  const [editOmv, setEditOmv]     = useState("");
  const [editForSale, setEditForSale] = useState("");

  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const fetchProducts = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    setLoading(true);
    try {
      const res = await getProducts({
        search, page: p, limit: 20,
        ...(productType ? { productType } : {}),
      });
      const { products: prods, totalPages: tp } = res.data;
      setProducts(reset ? prods : (prev) => [...prev, ...prods]);
      setTotalPages(tp);
      if (!reset) setPage((x) => x + 1); else setPage(2);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, productType, page]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchProducts(true), 350);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [search, productType]);

  const openEdit = (p: any) => {
    setSelected(p);
    setEditName(p.name ?? "");
    setEditScale(p.scale?.toString() ?? "1");
    setEditOmv(p.omv?.toString() ?? "");
    setEditForSale(p.isForSale ? "true" : "false");
    setModal(true);
  };

  const handleHold = async (productId: string, currentHold: boolean) => {
    Alert.alert(
      currentHold ? "Remove Hold" : "Place on Hold",
      currentHold ? "Remove hold from this product?" : "This will mark product as on hold.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: async () => {
          try {
            await adminHoldProduct(productId);
            fetchProducts(true);
          } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || "Failed");
          }
        }},
      ]
    );
  };

  const handleSave = async () => {
    if (!selected) return;
    setActing(true);
    try {
      const payload: any = {};
      if (editName !== selected.name) payload.name = editName;
      if (editScale !== selected.scale?.toString()) payload.scale = editScale;
      if (editOmv !== selected.omv?.toString()) payload.omv = editOmv;
      if (editForSale !== (selected.isForSale ? "true" : "false")) payload.isForSale = editForSale;

      if (Object.keys(payload).length === 0) {
        Alert.alert("No changes", "Nothing was changed");
        return;
      }
      await adminUpdateProduct(selected.id, payload);
      Alert.alert("Saved", "Product updated successfully");
      setModal(false);
      fetchProducts(true);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Update failed");
    } finally { setActing(false); }
  };

  const TYPES = ["", "GADGET","ELECTRONICS","VEHICLE","FURNITURE","CLOTHING","BOOK","ACADEMIC_BOOK","STATIONARY","MUSICAL_INSTRUMENT","APARTMENTS","OTHERS"];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 px-5 pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-lg font-semibold flex-1">Manage Products</Text>
        </View>

        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 mb-3">
          <Ionicons name="search-outline" size={15} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 py-2.5 text-sm text-gray-900"
            placeholder="Search by name, SL, tags..."
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

        {/* Type filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {TYPES.map((t) => {
            const active = productType === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                className={`px-3 py-1.5 rounded-full border ${active ? "bg-gray-900 border-gray-900" : "bg-white border-gray-200"}`}
              >
                <Text className={`text-xs font-medium ${active ? "text-white" : "text-gray-600"}`}>
                  {t === "" ? "All" : t.replace(/_/g, " ")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(true); }} tintColor="#111827" />
        }
        onEndReached={() => { if (!loading && page <= totalPages) fetchProducts(); }}
        onEndReachedThreshold={0.4}
        renderItem={({ item: p }) => {
          const imgUrl = p.optimizedImages?.[0] ? `${BASE}${p.optimizedImages[0]}` : p.productImages?.[0] ? `${BASE}${p.productImages[0]}` : null;
          const cc = CONDITION_COLORS[p.productCondition] ?? "#6b7280";
          return (
            <TouchableOpacity
              onPress={() => openEdit(p)}
              activeOpacity={0.85}
              className="bg-white border border-gray-100 rounded-2xl mb-3 overflow-hidden"
              style={{ elevation: 1, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }}
            >
              <View className="flex-row">
                {/* Thumbnail */}
                <View className="w-20 h-20 bg-gray-50">
                  {imgUrl
                    ? <Image source={{ uri: imgUrl }} className="w-full h-full" resizeMode="cover" />
                    : <View className="flex-1 items-center justify-center"><Ionicons name="cube-outline" size={24} color="#d1d5db" /></View>
                  }
                </View>

                <View className="flex-1 p-3">
                  <View className="flex-row items-start justify-between">
                    <Text className="text-gray-900 font-semibold text-sm flex-1 pr-2" numberOfLines={1}>{p.name}</Text>
                    <Text className="text-xs font-mono text-gray-400">{p.productSL}</Text>
                  </View>

                  <View className="flex-row items-center gap-2 mt-1">
                    <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: cc + "20" }}>
                      <Text className="text-xs font-medium" style={{ color: cc }}>
                        {p.productCondition.replace(/_/g, " ")}
                      </Text>
                    </View>
                    {p.isOnHold && (
                      <View className="bg-amber-100 px-1.5 py-0.5 rounded">
                        <Text className="text-amber-700 text-xs font-medium">ON HOLD</Text>
                      </View>
                    )}
                    {!p.isAvailable && (
                      <View className="bg-gray-100 px-1.5 py-0.5 rounded">
                        <Text className="text-gray-500 text-xs">Unavailable</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center justify-between mt-1.5">
                    <Text className="text-gray-900 text-sm font-bold">৳{p.pricePerDay}<Text className="text-gray-400 font-normal text-xs">/day</Text></Text>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); handleHold(p.id, p.isOnHold); }}
                        className={`px-2 py-1 rounded-lg ${p.isOnHold ? "bg-amber-100" : "bg-gray-100"}`}
                      >
                        <Text className={`text-xs font-medium ${p.isOnHold ? "text-amber-700" : "text-gray-500"}`}>
                          {p.isOnHold ? "Unhold" : "Hold"}
                        </Text>
                      </TouchableOpacity>
                      <View className="bg-gray-100 px-2 py-1 rounded-lg">
                        <Text className="text-gray-500 text-xs font-medium">Edit</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-20">
              <Ionicons name="cube-outline" size={36} color="#e5e7eb" />
              <Text className="text-gray-300 text-sm mt-3">No products found</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && products.length > 0
            ? <View className="py-6 items-center"><ActivityIndicator size="small" color="#6b7280" /></View>
            : null
        }
      />

      {loading && products.length === 0 && (
        <View className="absolute inset-0 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#111827" />
        </View>
      )}

      {/* Edit Modal */}
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 pt-6 pb-4 border-b border-gray-100">
            <Text className="text-gray-900 text-lg font-semibold">Admin Edit Product</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            {selected && (
              <>
                {/* Read-only info */}
                <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5">
                  <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">Current Values</Text>
                  {[
                    { l: "SL",         v: selected.productSL },
                    { l: "Type",       v: selected.productType },
                    { l: "Condition",  v: selected.productCondition },
                    { l: "Age",        v: `${selected.productAge} yr` },
                    { l: "Price/day",  v: `৳${selected.pricePerDay}` },
                    { l: "Price/hr",   v: selected.pricePerHour ? `৳${selected.pricePerHour}` : "N/A" },
                    { l: "Scale",      v: `${selected.scale ?? 1}` },
                  ].map(({ l, v }) => (
                    <View key={l} className="flex-row justify-between py-1.5">
                      <Text className="text-gray-400 text-sm">{l}</Text>
                      <Text className="text-gray-700 text-sm font-medium">{v}</Text>
                    </View>
                  ))}
                </View>

                <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-4">Edit Fields</Text>

                <Input
                  label="Product name"
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Product name"
                  leftIcon="cube-outline"
                />
                <Input
                  label="OMV ৳ (recalculates price)"
                  value={editOmv}
                  onChangeText={setEditOmv}
                  placeholder={`Current: ৳${selected.omv}`}
                  keyboardType="numeric"
                  leftIcon="pricetag-outline"
                  hint="Changing OMV will recalculate pricePerDay and secondHandPrice"
                />
                <Input
                  label="Scale multiplier"
                  value={editScale}
                  onChangeText={setEditScale}
                  placeholder="e.g. 1.2"
                  keyboardType="numeric"
                  leftIcon="resize-outline"
                  hint="Multiplies final calculated price. 1.0 = no change"
                />

                {/* For sale toggle */}
                <TouchableOpacity
                  onPress={() => setEditForSale(editForSale === "true" ? "false" : "true")}
                  className={`flex-row items-center justify-between border rounded-xl p-4 mb-6 ${editForSale === "true" ? "bg-gray-900 border-gray-900" : "bg-gray-50 border-gray-100"}`}
                >
                  <Text className={`text-sm font-medium ${editForSale === "true" ? "text-white" : "text-gray-900"}`}>
                    For Sale
                  </Text>
                  <View
                    className={`w-11 h-6 rounded-full ${editForSale === "true" ? "bg-white/20" : "bg-gray-200"}`}
                    style={{ justifyContent: "center", alignItems: editForSale === "true" ? "flex-end" : "flex-start", paddingHorizontal: 2 }}
                  >
                    <View className="w-5 h-5 rounded-full bg-white" />
                  </View>
                </TouchableOpacity>

                <View className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6 flex-row items-start gap-2">
                  <Ionicons name="warning-outline" size={14} color="#d97706" style={{ marginTop: 1 }} />
                  <Text className="text-amber-700 text-xs flex-1 leading-5">
                    Admin edits recalculate price using the new OMV × condition × scale. The Red Cache Credit for this product will also be updated.
                  </Text>
                </View>

                <Button label="Save Changes" onPress={handleSave} loading={acting} size="lg" />

                <Button
                  label={selected.isOnHold ? "Remove Hold" : "Place on Hold"}
                  onPress={() => { setModal(false); handleHold(selected.id, selected.isOnHold); }}
                  variant={selected.isOnHold ? "secondary" : "danger"}
                  size="md"
                  className="mt-3"
                />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
