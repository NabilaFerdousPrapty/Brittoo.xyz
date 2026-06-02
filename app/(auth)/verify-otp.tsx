import { resendOtp, verifyOtp } from "@/hooks/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/button";
import { STORAGE_KEYS } from "../../constants";

const OTP_LENGTH = 5;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOTPScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (val: string, idx: number) => {
    if (val.length > 1) {
      // Paste support: split across boxes
      const digits = val.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
      const next = [...otp];
      digits.forEach((d, i) => {
        if (idx + i < OTP_LENGTH) next[idx + i] = d;
      });
      setOtp(next);
      const lastFilled = Math.min(idx + digits.length, OTP_LENGTH - 1);
      inputs.current[lastFilled]?.focus();
      return;
    }
    const next = [...otp];
    next[idx] = val.replace(/\D/g, "");
    setOtp(next);
    if (val && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus();
  };

  const handleBackspace = (key: string, idx: number) => {
    if (key === "Backspace" && !otp[idx] && idx > 0) {
      const next = [...otp];
      next[idx - 1] = "";
      setOtp(next);
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      Alert.alert("Enter OTP", "Please enter all 5 digits");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(email!, code);
      if (res.data.success) {
        await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, res.data.token);
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER,
          JSON.stringify(res.data.user),
        );
        Alert.alert(
          "✅ Verified!",
          "Your email has been verified successfully.",
          [
            {
              text: "Continue",
              onPress: () => router.replace("/(tabs)/browse"),
            },
          ],
        );
      }
    } catch (err: any) {
      // Show specific error message from backend
      const msg = err?.response?.data?.message || "Verification failed";
      Alert.alert("Error", msg);
      setOtp(["", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await resendOtp(email!);
      if (res.data.success) {
        Alert.alert("OTP Sent", `A new code was sent to ${email}`);
        setCountdown(RESEND_COOLDOWN);
        setCanResend(false);
        setOtp(["", "", "", "", ""]);
        inputs.current[0]?.focus();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to resend OTP";
      Alert.alert("Error", msg);
    } finally {
      setResendLoading(false);
    }
  };

  const maskedEmail = email
    ? email.replace(
        /^(.{2})(.+)(@.+)$/,
        (_, a, b, c) => a + "*".repeat(b.length) + c,
      )
    : "";

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-4 py-10">
        {/* Card container */}
        <View className="bg-white rounded-3xl shadow-xl px-6 py-8 border border-gray-100">
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4 self-start"
          >
            <Ionicons name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>

          {/* Email icon */}
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-6 self-center">
            <Ionicons name="mail-outline" size={28} color="#6b7280" />
          </View>

          <Text className="text-gray-800 text-2xl font-bold text-center mb-2">
            Check your email
          </Text>
          <Text className="text-gray-500 text-sm text-center mb-1">
            We sent a 5-digit code to
          </Text>
          <Text className="text-gray-900 text-sm font-semibold text-center mb-8">
            {maskedEmail}
          </Text>

          {/* OTP Boxes */}
          <View className="flex-row justify-between gap-3 mb-8">
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(r) => (inputs.current[idx] = r)}
                className={`flex-1 aspect-square text-center text-gray-800 text-2xl font-bold rounded-2xl border ${
                  digit
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
                maxLength={1}
                keyboardType="numeric"
                value={digit}
                onChangeText={(v) => handleChange(v, idx)}
                onKeyPress={({ nativeEvent }) =>
                  handleBackspace(nativeEvent.key, idx)
                }
                selectTextOnFocus
              />
            ))}
          </View>

          <Button
            label="Verify Email"
            onPress={handleVerify}
            loading={loading}
            size="lg"
            className="mb-6"
          />

          {/* Resend section */}
          <View className="items-center">
            <Text className="text-gray-500 text-sm mb-2">
              Didn't receive the code?
            </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                <Text className="text-gray-900 text-sm font-semibold">
                  {resendLoading ? "Sending..." : "Resend Code"}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-500 text-sm">
                Resend in{" "}
                <Text className="text-gray-900 font-semibold">
                  {countdown}s
                </Text>
              </Text>
            )}
          </View>

          {/* Expiry notice */}
          <View className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex-row items-center gap-2">
            <Ionicons name="time-outline" size={14} color="#ca8a04" />
            <Text className="text-yellow-700 text-xs flex-1">
              This code expires in 5 minutes
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
