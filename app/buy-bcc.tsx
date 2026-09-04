import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { buyBcc } from "../hooks/api";

// ASSUMPTION: `paymentGateway` is typed as a plain string on the backend with
// no visible enum, so these three options (the standard Bangladeshi mobile
// payment providers) are a guess at what's actually accepted. Confirm the
// real allowed values before relying on this — if the backend validates a
// specific string set and these don't match, submissions will fail.
const PAYMENT_GATEWAYS = ["bKash", "Nagad", "Rocket"];

export default function BuyBccScreen() {
  const [paymentGateway, setPaymentGateway] = useState(PAYMENT_GATEWAYS[0]);
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [trxNo, setTrxNo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      e.amount = "Enter a valid amount";
    }
    if (!transactionId.trim()) e.transactionId = "Transaction ID is required";
    if (!trxNo.trim() || trxNo.trim().length < 10) {
      e.trxNo = "Enter the phone number used for the transaction";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      await buyBcc({
        paymentGateway,
        amount: Number(amount),
        transactionId: transactionId.trim(),
        trxNo: trxNo.trim(),
      });
      Alert.alert(
        "Request submitted",
        "Your BCC purchase is pending admin approval. You'll be notified once it's reviewed.",
        [
          {
            text: "Back to wallet",
            onPress: () => router.replace("/wallet"),
          },
        ],
      );
    } catch (err: any) {
      if (err?.response?.data?.errorType === "VERIFICATION_ERROR") {
        Alert.alert(
          "Verification required",
          "Please verify your account before buying credits.",
        );
      } else {
        Alert.alert("Error", err?.response?.data?.message || "Failed to submit request");
      }
    } finally {
      setSubmitting(false);
    }
  };

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
          <Text className="text-gray-900 text-2xl font-semibold">Buy BCC</Text>
          <Text className="text-gray-400 text-sm mt-1">
            Send the payment first, then submit the details here
          </Text>
        </View>

        <View className="px-5 pt-5 pb-10">
          <Text className="text-gray-500 text-xs font-medium mb-2 ml-0.5">
            Payment method
          </Text>
          <View className="flex-row gap-2 mb-4">
            {PAYMENT_GATEWAYS.map((gw) => {
              const active = paymentGateway === gw;
              return (
                <TouchableOpacity
                  key={gw}
                  onPress={() => setPaymentGateway(gw)}
                  className={`flex-1 items-center py-2.5 rounded-xl border ${
                    active ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${active ? "text-white" : "text-gray-600"}`}
                  >
                    {gw}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="Amount ৳"
            placeholder="e.g. 500"
            leftIcon="cash-outline"
            value={amount}
            onChangeText={setAmount}
            error={errors.amount}
            keyboardType="numeric"
          />

          <Input
            label="Transaction ID"
            placeholder={`e.g. the ${paymentGateway} transaction ID`}
            leftIcon="receipt-outline"
            value={transactionId}
            onChangeText={setTransactionId}
            error={errors.transactionId}
          />

          <Input
            label="Phone number used"
            placeholder="1XXXXXXXXX"
            leftIcon="call-outline"
            value={trxNo}
            onChangeText={setTrxNo}
            error={errors.trxNo}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <View className="flex-row items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 mt-2">
            <Ionicons name="information-circle-outline" size={14} color="#2563eb" />
            <Text className="text-blue-700 text-xs flex-1 leading-5">
              Send ৳{amount || "___"} to Brittoo's {paymentGateway} number first, then submit
              the transaction ID and the phone number you sent it from. An admin will verify
              and approve the credit.
            </Text>
          </View>

          <Button
            label="Submit request"
            onPress={submitting ? () => {} : handleSubmit}
            loading={submitting}
            size="lg"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}