import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import {
    BACKEND_URL,
    getProducts,
    placePurchaseRequest,
    Product,
    PurchaseCollectionMethod,
} from "../../hooks/api";

const COLLECTION_METHODS: { value: PurchaseCollectionMethod; label: string; desc: string; icon: any }[] = [
    {
        value: "HOME",
        label: "Home delivery",
        desc: "Seller drops it off at your address",
        icon: "home-outline",
    },
    {
        value: "BRITTOO_TERMINAL",
        label: "Brittoo terminal",
        desc: "Pick up from a Brittoo terminal",
        icon: "business-outline",
    },
];

export default function PlacePurchaseRequestScreen() {
    const { productId } = useLocalSearchParams<{ productId: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [dealPrice, setDealPrice] = useState("");
    const [buyerCollectionMethod, setBuyerCollectionMethod] =
        useState<PurchaseCollectionMethod>("HOME");
    const [buyerPhoneNumber, setBuyerPhoneNumber] = useState("");
    const [buyerDeliveryAddress, setBuyerDeliveryAddress] = useState("");
    const [buyerPickupTerminal, setBuyerPickupTerminal] = useState("");

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        setLoadingProduct(true);
        try {
            const res = await getProducts({ productId });
            const p = res.data.products?.[0];
            if (p) {
                setProduct(p);
                if (p.askingPrice) setDealPrice(p.askingPrice.toString());
            }
        } catch (err) {
            console.error("Failed to load product:", err);
        } finally {
            setLoadingProduct(false);
        }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!dealPrice || isNaN(Number(dealPrice))) {
            e.dealPrice = "Enter a valid offer price";
        } else if (product?.minPrice && Number(dealPrice) < product.minPrice) {
            e.dealPrice = `Offer can't be below ৳${product.minPrice}`;
        }
        if (!buyerPhoneNumber.trim()) e.buyerPhoneNumber = "Phone number is required";
        if (buyerCollectionMethod === "HOME" && !buyerDeliveryAddress.trim()) {
            e.buyerDeliveryAddress = "Delivery address is required";
        }
        if (buyerCollectionMethod === "BRITTOO_TERMINAL" && !buyerPickupTerminal.trim()) {
            e.buyerPickupTerminal = "Pickup terminal is required";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!product) return;
        if (submitting) return; // guard against double-taps firing duplicate requests
        if (!validate()) return;
        setSubmitting(true);
        try {
            await placePurchaseRequest({
                productId: product.id,
                dealPrice,
                buyerCollectionMethod,
                buyerPhoneNumber,
                buyerDeliveryAddress:
                    buyerCollectionMethod === "HOME" ? buyerDeliveryAddress : null,
                buyerPickupTerminal:
                    buyerCollectionMethod === "BRITTOO_TERMINAL" ? buyerPickupTerminal : null,
            });
            Alert.alert("Offer sent", "Your purchase request has been sent to the seller.", [
                {
                    text: "View my requests",
                    onPress: () =>
                        router.replace({
                            pathname: "/(products)/requests",
                            params: { type: "purchase", tab: "placed" },
                        }),
                },
                { text: "Done", onPress: () => router.back() },
            ]);
        } catch (err: any) {
            console.log("PURCHASE REQUEST ERROR:", JSON.stringify({
                message: err?.message,
                hasResponse: !!err?.response,
                status: err?.response?.status,
                data: err?.response?.data,
            }, null, 2));
            Alert.alert("Error", err?.response?.data?.message || "Failed to send request");
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

    const thumb =
        product.optimizedImages?.[0] || product.productImages?.[0] || null;

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
                    <TouchableOpacity onPress={() => router.back()} className="mb-4 self-start">
                        <Ionicons name="arrow-back" size={22} color="#10b981" />
                    </TouchableOpacity>
                    <Text className="text-gray-900 text-2xl font-semibold">Make an offer</Text>
                    <Text className="text-gray-400 text-sm mt-1">
                        Send a purchase request to the seller
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
                            {product.askingPrice != null && (
                                <Text className="text-gray-500 text-xs mt-0.5">
                                    Asking price: ৳{product.askingPrice}
                                </Text>
                            )}
                            {product.minPrice != null && (
                                <Text className="text-gray-400 text-xs">
                                    Min. accepted: ৳{product.minPrice}
                                </Text>
                            )}
                        </View>
                    </View>

                    <Input
                        label="Your offer ৳"
                        placeholder="e.g. 4200"
                        leftIcon="cash-outline"
                        value={dealPrice}
                        onChangeText={setDealPrice}
                        error={errors.dealPrice}
                        keyboardType="numeric"
                    />

                    <Text className="text-gray-500 text-xs font-medium mb-2 ml-0.5 mt-1">
                        Collection method
                    </Text>
                    <View className="gap-3 mb-1">
                        {COLLECTION_METHODS.map((m) => {
                            const active = buyerCollectionMethod === m.value;
                            return (
                                <TouchableOpacity
                                    key={m.value}
                                    onPress={() => setBuyerCollectionMethod(m.value)}
                                    activeOpacity={0.85}
                                    className={`flex-row items-center gap-3 border rounded-xl p-3 ${active ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-200"
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
                            label="Your phone number"
                            placeholder="e.g. 01700000000"
                            leftIcon="call-outline"
                            value={buyerPhoneNumber}
                            onChangeText={setBuyerPhoneNumber}
                            error={errors.buyerPhoneNumber}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {buyerCollectionMethod === "HOME" ? (
                        <Input
                            label="Delivery address"
                            placeholder="House, road, area..."
                            leftIcon="location-outline"
                            value={buyerDeliveryAddress}
                            onChangeText={setBuyerDeliveryAddress}
                            error={errors.buyerDeliveryAddress}
                            multiline
                            numberOfLines={2}
                            style={{ minHeight: 60, textAlignVertical: "top" }}
                        />
                    ) : (
                        <Input
                            label="Pickup terminal"
                            placeholder="e.g. RUET Terminal"
                            leftIcon="business-outline"
                            value={buyerPickupTerminal}
                            onChangeText={setBuyerPickupTerminal}
                            error={errors.buyerPickupTerminal}
                        />
                    )}

                    <View className="flex-row items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-6 mt-2">
                        <Ionicons name="information-circle-outline" size={14} color="#10b981" />
                        <Text className="text-emerald-700 text-xs flex-1 leading-5">
                            The seller can accept, reject, or let this offer sit until you cancel it.
                            A platform charge is added to the final deal price.
                        </Text>
                    </View>

                    <Button
                        label="Send offer"
                        onPress={submitting ? () => { } : handleSubmit}
                        loading={submitting}
                        size="lg"
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}