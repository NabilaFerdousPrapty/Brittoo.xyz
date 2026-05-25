// app/(auth)/verify-otp.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useAuthStore from "../../store/useAuthStore";

export default function VerifyOtp() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, resendOtp, isLoading } = useAuthStore();
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start countdown once on mount
  useEffect(() => {
    if (timer > 0 && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            // Time's up
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // ✅ Empty dependency array – runs only once

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 5) {
      Alert.alert("Error", "Please enter the 5-digit code");
      return;
    }
    const result = await verifyOtp(email, otpCode);
    if (result.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Verification Failed", result.error);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    const result = await resendOtp(email);
    if (result.success) {
      // Reset timer and disable resend button
      setTimer(300);
      setCanResend(false);

      // Clear existing interval and start fresh
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      Alert.alert("OTP Resent", "Check your email for a new code");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  const onChangeText = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 4) inputs.current[index + 1]?.focus();
    if (!text && index > 0) inputs.current[index - 1]?.focus();
  };

  return (
    <LinearGradient
      colors={["#ffffff", "#f9fafb"]}
      style={{ flex: 1, justifyContent: "center" }}
    >
      <View className="px-6">
        <View className="bg-white rounded-3xl p-8 shadow-lg">
          <Text className="text-2xl font-bold text-center text-gray-900 mb-2">
            Verify Your Email
          </Text>
          <Text className="text-center text-gray-500 mb-6">
            Enter the 5‑digit code sent to{"\n"}
            {email}
          </Text>

          <View className="flex-row justify-between mb-8">
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => (inputs.current[idx] = ref)}
                className="w-14 h-14 border border-gray-300 rounded-xl text-center text-xl font-bold bg-gray-50"
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => onChangeText(text, idx)}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleVerify}
            disabled={isLoading}
            className={`py-3 rounded-xl ${isLoading ? "bg-gray-400" : "bg-green-600"}`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">
                Verify
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Didn't receive the code? </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text className="text-green-600 font-semibold">Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-400">
                Resend in {Math.floor(timer / 60)}:
                {String(timer % 60).padStart(2, "0")}
              </Text>
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
