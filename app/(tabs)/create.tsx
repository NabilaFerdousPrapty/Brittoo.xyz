import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { createProduct } from "../../hooks/api";

const PRODUCT_TYPES = [
  "GADGET",
  "ELECTRONICS",
  "VEHICLE",
  "FURNITURE",
  "CLOTHING",
  "BOOK",
  "ACADEMIC_BOOK",
  "STATIONARY",
  "MUSICAL_INSTRUMENT",
  "APARTMENTS",
  "OTHERS",
];
const CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"];
const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

type PickerField = "productType" | "productCondition";

export default function CreateProductScreen() {
  const [form, setForm] = useState({
    name: "",
    productType: "GADGET",
    productCondition: "GOOD",
    productAge: "",
    omv: "",
    tags: "",
    productDescription: "",
    isForSale: "false",
    isForSaleOnly: "false",
    isAiEnabled: "false",
    askingPrice: "",
    minPrice: "",
  });
  const [images, setImages] = useState<
    { uri: string; name: string; type: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const toggleBool = (field: "isForSale" | "isForSaleOnly" | "isAiEnabled") =>
    setForm((f) => ({ ...f, [field]: f[field] === "true" ? "false" : "true" }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.omv || isNaN(Number(form.omv))) e.omv = "Valid OMV is required";
    if (!form.productAge || isNaN(Number(form.productAge)))
      e.productAge = "Valid age is required";
    if (images.length === 0) e.images = "At least one image is required";
    if (form.isForSale === "true") {
      if (!form.askingPrice) e.askingPrice = "Asking price required";
      if (!form.minPrice) e.minPrice = "Min price required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pickImages = async () => {
    if (images.length >= 4) {
      Alert.alert("Limit reached", "Maximum 4 images allowed");
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 4 - images.length,
    });

    if (!result.canceled) {
      const newImgs = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName || `product-${Date.now()}.jpg`,
        type: a.mimeType || "image/jpeg",
      }));
      setImages((prev) => [...prev, ...newImgs].slice(0, 4));
    }
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await createProduct(form, images);
      if (res.data.success) {
        Alert.alert(
          "Listed!",
          `${form.name} is now live.\nRed Credit: ৳${res.data.rcc?.amount}`,
          [
            {
              text: "View",
              onPress: () =>
                router.replace({
                  pathname: "/(products)/[id]",
                  params: { id: res.data.product.id },
                }),
            },
            { text: "Browse", onPress: () => router.replace("/listing") },
          ],
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to create listing",
      );
    } finally {
      setLoading(false);
    }
  };

  const Chip = ({
    label,
    value,
    field,
    options,
  }: {
    label: string;
    value: string;
    field: PickerField;
    options: string[];
  }) => (
    <View className="mb-4">
      <Text className="text-gray-500 text-xs font-medium mb-2 ml-0.5">
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {options.map((opt) => {
          const active = value === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => setForm((f) => ({ ...f, [field]: opt }))}
              className={`px-3 py-2 rounded-xl border ${active ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"}`}
            >
              <Text
                className={`text-xs font-medium ${active ? "text-white" : "text-gray-600"}`}
              >
                {field === "productCondition"
                  ? CONDITION_LABELS[opt]
                  : opt.replace(/_/g, " ")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const Toggle = ({
    label,
    field,
    desc,
  }: {
    label: string;
    field: "isForSale" | "isForSaleOnly" | "isAiEnabled";
    desc?: string;
  }) => {
    const active = form[field] === "true";
    return (
      <TouchableOpacity
        onPress={() => toggleBool(field)}
        className={`flex-row items-center justify-between border rounded-xl p-3 mb-3 ${active ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"}`}
        activeOpacity={0.85}
      >
        <View className="flex-1">
          <Text
            className={`text-sm font-medium ${active ? "text-white" : "text-gray-900"}`}
          >
            {label}
          </Text>
          {desc && (
            <Text
              className={`text-xs mt-0.5 ${active ? "text-emerald-100" : "text-gray-400"}`}
            >
              {desc}
            </Text>
          )}
        </View>
        <View
          className={`w-11 h-6 rounded-full items-center justify-center ${active ? "bg-white/30" : "bg-gray-300"}`}
        >
          <View
            className={`w-5 h-5 rounded-full ${active ? "bg-white translate-x-2" : "bg-white -translate-x-2"}`}
          />
        </View>
      </TouchableOpacity>
    );
  };

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
            List an item
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            Fill in details to list your product
          </Text>
        </View>

        <View className="px-5 pt-5 pb-10">
          {/* Images */}
          <Text className="text-gray-500 text-xs font-medium mb-2 ml-0.5">
            Photos (max 4)
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-1">
            {images.map((img, i) => (
              <View key={i} className="relative w-[72px] h-[72px]">
                <Image
                  source={{ uri: img.uri }}
                  className="w-full h-full rounded-xl"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={11} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 4 && (
              <TouchableOpacity
                onPress={pickImages}
                className="w-[72px] h-[72px] border border-dashed border-emerald-200 rounded-xl items-center justify-center bg-emerald-50"
              >
                <Ionicons name="add" size={22} color="#10b981" />
              </TouchableOpacity>
            )}
          </View>
          {errors.images && (
            <Text className="text-red-400 text-xs mb-3 ml-0.5">
              {errors.images}
            </Text>
          )}

          <View className="mb-2" />

          <Input
            label="Product name"
            placeholder="e.g. Arduino Uno R3"
            leftIcon="cube-outline"
            value={form.name}
            onChangeText={set("name")}
            error={errors.name}
          />

          <Chip
            label="Product type"
            value={form.productType}
            field="productType"
            options={PRODUCT_TYPES}
          />
          <Chip
            label="Condition"
            value={form.productCondition}
            field="productCondition"
            options={CONDITIONS}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Market value (OMV) ৳"
                placeholder="e.g. 5000"
                leftIcon="pricetag-outline"
                value={form.omv}
                onChangeText={set("omv")}
                error={errors.omv}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Age (years)"
                placeholder="e.g. 2"
                leftIcon="time-outline"
                value={form.productAge}
                onChangeText={set("productAge")}
                error={errors.productAge}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="Description"
            placeholder="Describe your product..."
            leftIcon="document-text-outline"
            value={form.productDescription}
            onChangeText={set("productDescription")}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />

          <Input
            label="Tags (comma separated)"
            placeholder="e.g. arduino, microcontroller, iot"
            leftIcon="pricetags-outline"
            value={form.tags}
            onChangeText={set("tags")}
          />

          {/* Sale options */}
          <Text className="text-gray-500 text-xs font-medium mb-2 ml-0.5 mt-1">
            Options
          </Text>
          <Toggle
            label="For sale"
            field="isForSale"
            desc="List this item for purchase"
          />
          <Toggle
            label="Sale only (disable renting)"
            field="isForSaleOnly"
            desc="Item can't be rented, only purchased"
          />
          <Toggle
            label="AI recommendations"
            field="isAiEnabled"
            desc="Include in AI-powered search results"
          />

          {form.isForSale === "true" && (
            <View className="flex-row gap-3 mt-1">
              <View className="flex-1">
                <Input
                  label="Asking price ৳"
                  placeholder="e.g. 4500"
                  leftIcon="cash-outline"
                  value={form.askingPrice}
                  onChangeText={set("askingPrice")}
                  error={errors.askingPrice}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Min. price ৳"
                  placeholder="e.g. 3500"
                  leftIcon="arrow-down-outline"
                  value={form.minPrice}
                  onChangeText={set("minPrice")}
                  error={errors.minPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {/* Info box */}
          <View className="flex-row items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-6 mt-2">
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#10b981"
            />
            <Text className="text-emerald-700 text-xs flex-1 leading-5">
              Price per day is automatically calculated based on your OMV,
              condition, age, and security score. You'll also receive a Red
              Cache Credit for listing.
            </Text>
          </View>

          <Button
            label="List Product"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
