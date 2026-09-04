
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
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
import { loginUser } from "../../hooks/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------------
  // Animations
  // ----------------------------------------------------------

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  // ----------------------------------------------------------
  // Validation
  // ----------------------------------------------------------

  const validate = () => {
    const e: Record<string, string> = {};

    if (!email.trim()) {
      e.email = "Email is required";
    }

    if (!password) {
      e.password = "Password is required";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await loginUser(
        email.trim().toLowerCase(),
        password,
      );

      if (res.data.success) {
        // Store token
        await SecureStore.setItemAsync(
          STORAGE_KEYS.TOKEN,
          res.data.token,
        );

        // Store user
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER,
          JSON.stringify(res.data.user),
        );

        // Navigate to main app
        router.replace("/dashboard");
      } else {
        Alert.alert(
          "Login failed",
          res.data.message || "Unknown error",
        );
      }
    } catch (err: any) {
      console.log("Login error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message || "Login failed";

      if (status === 429) {
        Alert.alert("Too many attempts", msg);
      } else if (status === 401) {
        setErrors({
          password: "Incorrect email or password",
        });
      } else if (
        status === undefined ||
        err.message === "Network Error"
      ) {
        Alert.alert(
          "Connection Error",
          "Cannot reach the server. Make sure the backend is running and the base URL is correct.",
        );
      } else {
        Alert.alert("Sign in failed", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F7FBF8]"
      behavior={
        Platform.OS === "ios" ? "padding" : "height"
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim,
              },
            ],
          }}
          className="justify-center px-5 py-10"
        >
          {/* ------------------------------------------------ */}
          {/* Top Green Accent */}
          {/* ------------------------------------------------ */}

          <View className="absolute top-0 left-0 right-0 h-1 bg-[#16A34A]" />

          {/* ------------------------------------------------ */}
          {/* Main Card */}
          {/* ------------------------------------------------ */}

          <View className="bg-white rounded-[28px] px-6 py-8 border border-[#DCEFE2]">
            {/* Logo */}

            <Animated.View
              style={{
                transform: [
                  {
                    scale: logoScale,
                  },
                ],
              }}
              className="items-center mb-5"
            >
              <View className="items-center justify-center rounded-2xl bg-[#F0FDF4] px-5 py-2">
                <Image
                  source={require("../../assets/images/brittoo-logo.png")}
                  style={{
                    width: 175,
                    height: 68,
                  }}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>

            {/* Heading */}

            <Text className="text-[#16301F] text-[27px] font-bold text-center">
              Welcome back
            </Text>

            <Text className="text-[#64806C] text-sm text-center mt-1 mb-7">
              Sign in to continue to Brittoo
            </Text>

            {/* ------------------------------------------------ */}
            {/* Email */}
            {/* ------------------------------------------------ */}

            <Input
              label="University email"
              placeholder="your@university.edu"
              leftIcon="mail-outline"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoComplete="email"
            />

            {/* ------------------------------------------------ */}
            {/* Password */}
            {/* ------------------------------------------------ */}

            <View className="mt-1">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-[#64806C] text-xs font-semibold ml-0.5">
                  Password
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push(
                      "/(auth)/forgot-password",
                    )
                  }
                >
                  <Text className="text-[#166534] text-xs font-bold">
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              <Input
                placeholder="Your password"
                leftIcon="lock-closed-outline"
                isPassword
                value={password}
                onChangeText={setPassword}
                error={errors.password}
              />
            </View>

            {/* ------------------------------------------------ */}
            {/* Sign In Button */}
            {/* ------------------------------------------------ */}

            <Animated.View
              style={{
                transform: [
                  {
                    scale: buttonScale,
                  },
                ],
              }}
              className="mt-3"
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleLogin}
                onPressIn={pressIn}
                onPressOut={pressOut}
                disabled={loading}
              >
                <Button
                  label="Sign in"
                  onPress={handleLogin}
                  loading={loading}
                  size="lg"
                  className="mb-5 "
                />
              </TouchableOpacity>
            </Animated.View>

            {/* ------------------------------------------------ */}
            {/* Divider */}
            {/* ------------------------------------------------ */}

            <View className="flex-row items-center gap-3 mb-5">
              <View className="flex-1 h-[1px] bg-[#E1EEE5]" />

              <View className="px-3 py-1 rounded-full bg-[#F0FDF4]">
                <Text className="text-[#6B8A74] text-[10px] font-bold tracking-wide">
                  SECURE
                </Text>
              </View>

              <View className="flex-1 h-[1px] bg-[#E1EEE5]" />
            </View>

            {/* ------------------------------------------------ */}
            {/* Security Info */}
            {/* ------------------------------------------------ */}

            <View className="flex-row items-center bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-3.5">
              <View className="w-9 h-9 rounded-full bg-white items-center justify-center mr-3">
                <Text className="text-base">
                  🔒
                </Text>
              </View>

              <Text className="text-[#64806C] text-xs flex-1 leading-5">
                For security, sign-in is paused after
                5 failed attempts within 15 minutes.
              </Text>
            </View>
          </View>

          {/* ------------------------------------------------ */}
          {/* Sign Up */}
          {/* ------------------------------------------------ */}

          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-[#64806C] text-sm">
              Don't have an account?
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push("/(auth)/signup")
              }
              className="ml-1.5 px-1"
            >
              <Text className="text-[#166534] text-sm font-bold">
                Sign up
              </Text>
            </TouchableOpacity>
          </View>

          {/* ------------------------------------------------ */}
          {/* Brittoo Tagline */}
          {/* ------------------------------------------------ */}

          <Text className="text-[#8AA394] text-[10px] text-center mt-7 tracking-[1.5px]">
            OWN LESS • ACCESS MORE
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}