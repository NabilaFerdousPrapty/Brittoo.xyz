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
      className="flex-1 bg-[#0a0a14]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-6 pt-14 pb-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 self-start"
        >
          <Ionicons name="arrow-back" size={24} color="#6c63ff" />
        </TouchableOpacity>

        {/* Icon */}
        <View className="w-16 h-16 bg-[#6c63ff]/20 border border-[#6c63ff]/40 rounded-3xl items-center justify-center mb-6">
          <Ionicons name="mail-open-outline" size={28} color="#6c63ff" />
        </View>

        <Text className="text-[#f1f5f9] text-3xl font-bold mb-2">
          Check your email
        </Text>
        <Text className="text-[#6b7280] text-sm mb-2">
          We sent a 5-digit code to
        </Text>
        <Text className="text-[#8b84ff] text-sm font-semibold mb-10">
          {maskedEmail}
        </Text>

        {/* OTP Boxes */}
        <View className="flex-row justify-between gap-3 mb-8">
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(r) => {
                inputs.current[idx] = r;
              }}
              className={`flex-1 aspect-square text-center text-[#f1f5f9] text-2xl font-bold rounded-2xl border ${
                digit
                  ? "border-[#6c63ff] bg-[#6c63ff]/10"
                  : "border-[#2a2a40] bg-[#12121f]"
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

        {/* Resend */}
        <View className="items-center">
          <Text className="text-[#6b7280] text-sm mb-2">
            Didn't receive the code?
          </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
              <Text className="text-[#6c63ff] text-sm font-semibold">
                {resendLoading ? "Sending..." : "Resend Code"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-[#6b7280] text-sm">
              Resend in{" "}
              <Text className="text-[#f1f5f9] font-semibold">{countdown}s</Text>
            </Text>
          )}
        </View>

        {/* Expiry notice */}
        <View className="mt-8 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-3 flex-row items-center gap-2">
          <Ionicons name="time-outline" size={14} color="#f59e0b" />
          <Text className="text-[#f59e0b] text-xs flex-1">
            This code expires in 5 minutes
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
