import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { getProducts, Product, updateProductUser } from "../../hooks/api";

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isForSale, setIsForSale] = useState(false);
  const [isForSaleOnly, setIsForSaleOnly] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [askingPrice, setAskingPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await getProducts({ productId: id });
      const p = res.data.products?.[0];
      if (p) {
        setProduct(p);
        setIsForSale(p.isForSale);
        setIsForSaleOnly(p.isForSaleOnly);
        setIsAvailable(p.isAvailable);
        setIsAiEnabled(p.isAiEnabled);
        setAskingPrice(p.askingPrice?.toString() ?? "");
        setMinPrice(p.minPrice?.toString() ?? "");
      }
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (isForSale && !askingPrice) e.askingPrice = "Asking price required";
    if (isForSale && !minPrice) e.minPrice = "Min price required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateProductUser(id!, {
        isForSale,
        isForSaleOnly,
        isAvailable,
        isAiEnabled,
        ...(isForSale ? { askingPrice, minPrice } : {}),
      });
      Alert.alert("Saved", "Product updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({
    label,
    value,
    onToggle,
    desc,
  }: {
    label: string;
    value: boolean;
    onToggle: () => void;
    desc?: string;
  }) => (
    <TouchableOpacity
      onPress={onToggle}
      className={`flex-row items-center justify-between border rounded-xl p-4 mb-3 ${
        value ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"
      }`}
      activeOpacity={0.85}
    >
      <View className="flex-1">
        <Text
          className={`text-sm font-medium ${value ? "text-white" : "text-gray-900"}`}
        >
          {label}
        </Text>
        {desc && (
          <Text
            className={`text-xs mt-0.5 ${value ? "text-emerald-100" : "text-gray-400"}`}
          >
            {desc}
          </Text>
        )}
      </View>
      <View
        className={`w-11 h-6 rounded-full ${value ? "bg-white/30" : "bg-gray-300"}`}
        style={{
          justifyContent: "center",
          alignItems: value ? "flex-end" : "flex-start",
          paddingHorizontal: 2,
        }}
      >
        <View className="w-5 h-5 rounded-full bg-white" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400 text-sm">Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400 text-sm">Product not found</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-emerald-600 font-medium">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="pt-14 px-5 pb-4 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4 self-start"
          >
            <Ionicons name="arrow-back" size={22} color="#10b981" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-2xl font-semibold">
            Edit listing
          </Text>
          <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
            {product.name}
          </Text>
        </View>

        <View className="px-5 pt-5 pb-10">
          {/* Read-only info */}
          <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-5">
            <Text className="text-emerald-700 text-xs uppercase tracking-wider font-medium mb-3">
              Product info (read-only)
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-emerald-600 text-sm">Name</Text>
              <Text className="text-gray-900 text-sm font-medium">
                {product.name}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-emerald-600 text-sm">Type</Text>
              <Text className="text-gray-900 text-sm font-medium">
                {product.productType.replace(/_/g, " ")}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-emerald-600 text-sm">Condition</Text>
              <Text className="text-gray-900 text-sm font-medium">
                {product.productCondition.replace(/_/g, " ")}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-emerald-600 text-sm">Price/day</Text>
              <Text className="text-gray-900 text-sm font-medium">
                ৳{product.pricePerDay}
              </Text>
            </View>
          </View>

          <Text className="text-gray-500 text-xs font-medium mb-3 ml-0.5 uppercase tracking-wider">
            Availability & Options
          </Text>

          <Toggle
            label="Available for rent"
            value={isAvailable}
            onToggle={() => setIsAvailable((p) => !p)}
            desc="Renters can request this item"
          />
          <Toggle
            label="For sale"
            value={isForSale}
            onToggle={() => setIsForSale((p) => !p)}
            desc="List this item for purchase"
          />
          <Toggle
            label="Sale only"
            value={isForSaleOnly}
            onToggle={() => setIsForSaleOnly((p) => !p)}
            desc="Disable renting, sale only"
          />
          <Toggle
            label="AI recommendations"
            value={isAiEnabled}
            onToggle={() => setIsAiEnabled((p) => !p)}
            desc="Appear in AI-powered search"
          />

          {isForSale && (
            <View className="mt-2">
              <Text className="text-gray-500 text-xs font-medium mb-3 ml-0.5 uppercase tracking-wider">
                Sale pricing
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Asking price ৳"
                    placeholder="e.g. 4500"
                    leftIcon="cash-outline"
                    value={askingPrice}
                    onChangeText={setAskingPrice}
                    error={errors.askingPrice}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Min. price ৳"
                    placeholder="e.g. 3500"
                    leftIcon="arrow-down-outline"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    error={errors.minPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}

          <View className="flex-row items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6 mt-2">
            <Ionicons
              name="warning-outline"
              size={14}
              color="#d97706"
              style={{ marginTop: 1 }}
            />
            <Text className="text-amber-700 text-xs flex-1 leading-5">
              To change product name, images, type, condition, or OMV — contact
              an admin.
            </Text>
          </View>

          <Button
            label="Save Changes"
            onPress={handleSave}
            loading={saving}
            size="lg"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
