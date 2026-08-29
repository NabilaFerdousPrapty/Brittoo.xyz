import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useMemo, useState } from "react";
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
import { STORAGE_KEYS } from "../../constants";
import { BACKEND_URL, createRentalRequest, getProducts, Product } from "../../hooks/api";

// Payload verified against ConfirmRentalRequestModal.jsx + the Express route
// (verifyToken + verificationMiddleware on POST /create-request). Fields not
// backed by any mobile UI yet — `coupon`, `paidWithBcc`/`usedBccAmount`,
// `paidWithRcc`/`usedRccData` — are sent as their "unused" defaults (null /
// false / 0 / []). If the backend requires at least one payment method to
// be selected, those will need a Red Credit / BCC wallet picker added here.

const MAX_DAYS = 15;
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const PERIODS: ("AM" | "PM")[] = ["AM", "PM"];
const DELIVERY_CHARGE = 10; // matches ConfirmRentalRequestModal.jsx (HOME only)

type CollectionMethod = "BRITTOO_TERMINAL" | "HOME";

const COLLECTION_METHODS: {
  value: CollectionMethod;
  label: string;
  desc: string;
  icon: any;
}[] = [
  {
    value: "BRITTOO_TERMINAL",
    label: "Terminal Pickup",
    desc: "Collect from our terminal (no charge)",
    icon: "location-outline",
  },
  {
    value: "HOME",
    label: "Home Delivery",
    desc: `Delivered to your address (৳${DELIVERY_CHARGE} extra)`,
    icon: "home-outline",
  },
];

const PICKUP_POINTS = [
  { value: "CSE_1", label: "CSE-1" },
  { value: "ADMIN_1", label: "Admin-1" },
  { value: "BANGABANDHU_HALL_1", label: "Bangabandhu Hall-1" },
  { value: "ZIA_HALL_1", label: "Zia Hall-1" },
  { value: "LIBRARY_1", label: "Library-1" },
];

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function diffInDays(a: Date, b: Date) {
  const ms = startOfDay(a).getTime() - startOfDay(b).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatDate(d: Date | null) {
  if (!d) return "Select date";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function conditionalCeilOrFloor(value: number) {
  const decimalPart = value - Math.floor(value);
  return decimalPart >= 0.5 ? Math.ceil(value) : Math.floor(value);
}

export default function PlaceRentalRequestScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<"start" | "end" | null>(null);

  const [isHourlyRental, setIsHourlyRental] = useState(false);
  const [numberOfHours, setNumberOfHours] = useState(1);
  const [startHour, setStartHour] = useState(2);
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");

  const [collectionMethod, setCollectionMethod] =
    useState<CollectionMethod>("BRITTOO_TERMINAL");
  const [pickupPoint, setPickupPoint] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProduct();
    SecureStore.getItemAsync(STORAGE_KEYS.USER).then((s) => {
      if (s) setCurrentUserId(JSON.parse(s).id);
    });
  }, [productId]);

  const loadProduct = async () => {
    setLoadingProduct(true);
    try {
      const res = await getProducts({ productId });
      const p = res.data.products?.[0];
      if (p) setProduct(p);
    } catch (err) {
      console.error("Failed to load product:", err);
    } finally {
      setLoadingProduct(false);
    }
  };

  const numberOfDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return diffInDays(endDate, startDate) + 1;
  }, [startDate, endDate]);

  // Same condition as the web app: hourly mode only for a single-day
  // booking on GADGET / VEHICLE listings.
  const canOfferHourly =
    numberOfDays === 1 &&
    (product?.productType === "GADGET" || product?.productType === "VEHICLE");

  useEffect(() => {
    if (!canOfferHourly && isHourlyRental) setIsHourlyRental(false);
  }, [canOfferHourly]);

  const deliveryCharge = collectionMethod === "HOME" ? DELIVERY_CHARGE : 0;

  const subtotal = useMemo(() => {
    if (!product) return 0;
    if (isHourlyRental && canOfferHourly) {
      const perHour = product.pricePerHour ?? Math.round(product.pricePerDay / 24);
      return perHour * numberOfHours;
    }
    return (product.pricePerDay ?? 0) * numberOfDays;
  }, [product, isHourlyRental, canOfferHourly, numberOfHours, numberOfDays]);

  const total = conditionalCeilOrFloor(subtotal + deliveryCharge);

  const onPickDate = (_event: any, date?: Date) => {
    if (Platform.OS === "android") setShowPicker(null);
    if (!date) return;
    if (showPicker === "start") {
      setStartDate(date);
      if (endDate && date > endDate) setEndDate(null);
    } else if (showPicker === "end") {
      setEndDate(date);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!startDate || !endDate) e.dates = "Select your rental start and end date";
    if (startDate && endDate && numberOfDays > MAX_DAYS) {
      e.dates = `Max rental period is ${MAX_DAYS} days`;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 10) {
      e.phoneNumber = "Enter a valid phone number";
    }
    if (collectionMethod === "HOME" && !deliveryAddress.trim()) {
      e.deliveryAddress = "Delivery address is required";
    }
    if (collectionMethod === "BRITTOO_TERMINAL" && !pickupPoint) {
      e.pickupPoint = "Select your nearest pickup point";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!product || !currentUserId) return;
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createRentalRequest({
        productId: product.id,
        coupon: null,
        requesterId: currentUserId,
        ownerId: product.owner.id,
        rentalStartDate: startDate!.toISOString(),
        rentalEndDate: endDate!.toISOString(),
        totalDays: numberOfDays,
        renterCollectionMethod: collectionMethod,
        renterPhoneNumber: `+880${phoneNumber.trim()}`,
        deliveryAddress: collectionMethod === "HOME" ? deliveryAddress : null,
        pickupPoint: collectionMethod === "BRITTOO_TERMINAL" ? pickupPoint : null,
        paidWithBcc: false,
        usedBccAmount: 0,
        paidWithRcc: false,
        usedRccData: [],
        isHourlyRental: isHourlyRental && canOfferHourly,
        pricePerHour: isHourlyRental && canOfferHourly ? product.pricePerHour : null,
        totalHours: isHourlyRental && canOfferHourly ? numberOfHours : null,
        pricePerDay: product.pricePerDay,
        startingHour:
          isHourlyRental && canOfferHourly ? `${startHour} ${startPeriod}` : null,
      });
      Alert.alert(
        "Request sent",
        "Rental request placed successfully. Waiting for the owner's approval.",
        [
          {
            text: "View my requests",
            onPress: () =>
              router.replace({
                pathname: "/(products)/requests",
                params: { type: "rental", tab: "placed" },
              }),
          },
          { text: "Done", onPress: () => router.back() },
        ],
      );
    } catch (err: any) {
      if (err?.response?.data?.errorType === "VERIFICATION_ERROR") {
        Alert.alert(
          "Verification required",
          "Please verify your account before renting something.",
        );
      } else {
        Alert.alert("Error", err?.response?.data?.message || "Failed to send request");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400 text-sm">Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={40} color="#e5e7eb" />
        <Text className="text-gray-400 text-sm mt-3">Product not found</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-emerald-600 font-medium">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const thumb = product.optimizedImages?.[0] || product.productImages?.[0] || null;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="pt-14 px-5 pb-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mb-4 self-start">
            <Ionicons name="arrow-back" size={22} color="#10b981" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-2xl font-semibold">Request to rent</Text>
          <Text className="text-gray-400 text-sm mt-1">
            Pick your dates and send a rental request
          </Text>
        </View>

        <View className="px-5 pt-5 pb-10">
          {/* Product summary */}
          <View className="flex-row items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-3 mb-6">
            {thumb ? (
              <Image
                source={{ uri: `${BACKEND_URL}${thumb}` }}
                className="w-14 h-14 rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-14 h-14 rounded-xl bg-gray-200 items-center justify-center">
                <Ionicons name="cube-outline" size={22} color="#9ca3af" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
                {product.name}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                ৳{product.pricePerDay} / day
                {product.pricePerHour != null ? `  •  ৳${product.pricePerHour} / hr` : ""}
              </Text>
            </View>
          </View>

          {/* Date range */}
          <Text className="text-gray-500 text-xs font-medium mb-2 ml-0.5">
            Rental period (max {MAX_DAYS} days)
          </Text>
          <View className="flex-row gap-3 mb-1">
            <TouchableOpacity
              onPress={() => setShowPicker("start")}
              className="flex-1 flex-row items-center gap-2 border border-gray-200 rounded-xl px-3 py-3"
            >
              <Ionicons name="calendar-outline" size={16} color="#10b981" />
              <View>
                <Text className="text-gray-400 text-[10px]">From</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {formatDate(startDate)}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => startDate && setShowPicker("end")}
              className="flex-1 flex-row items-center gap-2 border border-gray-200 rounded-xl px-3 py-3"
              style={{ opacity: startDate ? 1 : 0.5 }}
            >
              <Ionicons name="calendar-outline" size={16} color="#10b981" />
              <View>
                <Text className="text-gray-400 text-[10px]">To</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {formatDate(endDate)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {errors.dates && (
            <Text className="text-red-400 text-xs mb-2 ml-0.5">{errors.dates}</Text>
          )}
          {numberOfDays > 0 && (
            <Text className="text-emerald-600 text-xs mb-3 ml-0.5 font-medium">
              {numberOfDays} {numberOfDays === 1 ? "day" : "days"} selected
            </Text>
          )}

          {showPicker && (
            <View className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
              <DateTimePicker
                value={
                  showPicker === "start"
                    ? startDate ?? new Date()
                    : endDate ?? startDate ?? new Date()
                }
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                minimumDate={showPicker === "start" ? new Date() : startDate ?? new Date()}
                onChange={onPickDate}
              />
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  onPress={() => setShowPicker(null)}
                  className="bg-emerald-600 py-2 items-center"
                >
                  <Text className="text-white text-sm font-semibold">Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Hourly toggle — only for single-day GADGET/VEHICLE rentals */}
          {canOfferHourly && (
            <TouchableOpacity
              onPress={() => setIsHourlyRental((p) => !p)}
              activeOpacity={0.85}
              className={`flex-row items-center justify-between border rounded-xl p-3 mb-4 ${
                isHourlyRental ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"
              }`}
            >
              <View className="flex-row items-center gap-2 flex-1">
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={isHourlyRental ? "#fff" : "#10b981"}
                />
                <View>
                  <Text
                    className={`text-sm font-medium ${isHourlyRental ? "text-white" : "text-gray-900"}`}
                  >
                    Rent on an hourly basis
                  </Text>
                  <Text
                    className={`text-xs mt-0.5 ${isHourlyRental ? "text-emerald-100" : "text-gray-400"}`}
                  >
                    Cheaper for short, same-day use
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {isHourlyRental && canOfferHourly && (
            <View className="mb-4">
              <Text className="text-gray-500 text-xs font-medium mb-2 ml-0.5">
                Starting time
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6 }}
                className="mb-2"
              >
                {HOURS.map((h) => {
                  const active = startHour === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      onPress={() => setStartHour(h)}
                      className={`px-3 py-2 rounded-xl border ${
                        active ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${active ? "text-white" : "text-gray-600"}`}
                      >
                        {h}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View className="flex-row gap-2 mb-4">
                {PERIODS.map((p) => {
                  const active = startPeriod === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setStartPeriod(p)}
                      className={`px-4 py-2 rounded-xl border ${
                        active ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${active ? "text-white" : "text-gray-600"}`}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text className="text-gray-500 text-xs font-medium mb-2 ml-0.5">
                Number of hours (max 10)
              </Text>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  onPress={() => setNumberOfHours((h) => Math.max(1, h - 1))}
                  disabled={numberOfHours <= 1}
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    numberOfHours <= 1 ? "bg-gray-100" : "bg-emerald-50"
                  }`}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={numberOfHours <= 1 ? "#9ca3af" : "#10b981"}
                  />
                </TouchableOpacity>
                <View className="w-14 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100">
                  <Text className="text-emerald-700 text-base font-bold">{numberOfHours}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setNumberOfHours((h) => Math.min(10, h + 1))}
                  disabled={numberOfHours >= 10}
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    numberOfHours >= 10 ? "bg-gray-100" : "bg-emerald-50"
                  }`}
                >
                  <Ionicons
                    name="add"
                    size={16}
                    color={numberOfHours >= 10 ? "#9ca3af" : "#10b981"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Collection method */}
          <Text className="text-gray-500 text-xs font-medium mb-2 ml-0.5">
            Collection method
          </Text>
          <View className="gap-3 mb-1">
            {COLLECTION_METHODS.map((m) => {
              const active = collectionMethod === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => setCollectionMethod(m.value)}
                  activeOpacity={0.85}
                  className={`flex-row items-center gap-3 border rounded-xl p-3 ${
                    active ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"
                  }`}
                >
                  <Ionicons name={m.icon} size={18} color={active ? "#fff" : "#10b981"} />
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-medium ${active ? "text-white" : "text-gray-900"}`}
                    >
                      {m.label}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${active ? "text-emerald-100" : "text-gray-400"}`}
                    >
                      {m.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="mt-4">
            <Input
              label="Phone number"
              placeholder="1XXXXXXXXX"
              leftIcon="call-outline"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              error={errors.phoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {collectionMethod === "HOME" ? (
            <Input
              label="Delivery address"
              placeholder="Enter your delivery address"
              leftIcon="location-outline"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              error={errors.deliveryAddress}
              multiline
              numberOfLines={2}
              style={{ minHeight: 60, textAlignVertical: "top" }}
            />
          ) : (
            <View className="mb-4">
              <Text className="text-gray-500 text-xs font-medium mb-2 ml-0.5">
                Pickup point
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {PICKUP_POINTS.map((pt) => {
                  const active = pickupPoint === pt.value;
                  return (
                    <TouchableOpacity
                      key={pt.value}
                      onPress={() => setPickupPoint(pt.value)}
                      className={`px-3 py-2 rounded-xl border ${
                        active ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${active ? "text-white" : "text-gray-600"}`}
                      >
                        {pt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.pickupPoint && (
                <Text className="text-red-400 text-xs mt-2 ml-0.5">{errors.pickupPoint}</Text>
              )}
            </View>
          )}

          {/* Total */}
          {numberOfDays > 0 && (
            <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4">
              <Text className="text-emerald-700 text-xs mb-2 uppercase tracking-wider font-medium">
                Total amount
              </Text>
              <View className="gap-1 mb-2">
                <View className="flex-row justify-between">
                  <Text className="text-emerald-700 text-xs">
                    {isHourlyRental && canOfferHourly ? "Price per hour" : "Price per day"}
                  </Text>
                  <Text className="text-emerald-900 text-xs font-medium">
                    ৳{isHourlyRental && canOfferHourly ? product.pricePerHour : product.pricePerDay}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-emerald-700 text-xs">
                    Subtotal (
                    {isHourlyRental && canOfferHourly
                      ? `${numberOfHours} hr`
                      : `${numberOfDays} day${numberOfDays > 1 ? "s" : ""}`}
                    )
                  </Text>
                  <Text className="text-emerald-900 text-xs font-medium">৳{subtotal.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-emerald-700 text-xs">Delivery charge</Text>
                  <Text className="text-emerald-900 text-xs font-medium">৳{deliveryCharge}</Text>
                </View>
              </View>
              <Text className="text-emerald-800 text-2xl font-bold">৳{total}</Text>
            </View>
          )}

          <View className="flex-row items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6">
            <Ionicons name="information-circle-outline" size={14} color="#d97706" style={{ marginTop: 1 }} />
            <Text className="text-amber-700 text-xs flex-1 leading-5">
              Your account must be verified to send a rental request. Coupons and
              paying with Red Credit / wallet balance aren't available from the
              app yet — do that from the web dashboard if needed.
            </Text>
          </View>

          <Button
            label="Send rental request"
            onPress={submitting ? () => {} : handleSubmit}
            loading={submitting}
            size="lg"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}