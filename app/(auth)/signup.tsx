
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { registerUser } from "../../hooks/api";

const UNIVERSITY_HINT =
  "RUET: 2010033@student.ruet.ac.bd\nFormat: [roll]@student.ruet.ac.bd";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // ----------------------------------------------------------
  // Animations
  // ----------------------------------------------------------

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const hintHeight = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.timing(hintHeight, {
      toValue: showHint ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [showHint]);

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
  // Form helper
  // ----------------------------------------------------------

  const set = (field: string) => (val: string) =>
    setForm((f) => ({
      ...f,
      [field]: val,
    }));

  // ----------------------------------------------------------
  // Validation
  // ----------------------------------------------------------

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.name.trim()) {
      e.name = "Name is required";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    }

    // RUET email format validation
    const emailRegex = /^\d+@student\.ruet\.ac\.bd$/;

    if (form.email.trim() && !emailRegex.test(form.email.trim())) {
      e.email = "Use your RUET student email";
    }

    if (!form.password) {
      e.password = "Password is required";
    }

    if (form.password.length < 6) {
      e.password = "Minimum 6 characters";
    }

    if (form.password !== form.confirm) {
      e.confirm = "Passwords don't match";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // ----------------------------------------------------------
  // Register
  // ----------------------------------------------------------

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (res.data.success) {
        router.push({
          pathname: "/(auth)/verify-otp",
          params: {
            email: form.email.trim().toLowerCase(),
          },
        });
      }
    } catch (err: any) {
      let errorMessage =
        "Registration failed. Please try again.";

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message === "Network Error") {
        errorMessage =
          `Cannot connect to backend.\n\nMake sure:\n• Docker container is running (docker ps)\n• Port 5000 is mapped (-p 5000:5000)\n• Android emulator uses 10.0.2.2`;
      } else if (err.code === "ECONNREFUSED") {
        errorMessage =
          "Connection refused. Is the backend running?";
      }

      Alert.alert(
        "Registration Error",
        errorMessage,
      );
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
        Platform.OS === "ios"
          ? "padding"
          : "height"
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
          {/* Top green accent */}
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
                    width: 165,
                    height: 62,
                  }}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>

            {/* Heading */}

            <Text className="text-[#16301F] text-[27px] font-bold text-center">
              Create account
            </Text>

            <Text className="text-[#64806C] text-sm text-center mt-1 mb-7">
              Join your university network
            </Text>

            {/* ------------------------------------------------ */}
            {/* Name */}
            {/* ------------------------------------------------ */}

            <Input
              label="Full name"
              placeholder="Your full name"
              leftIcon="person-outline"
              value={form.name}
              onChangeText={set("name")}
              error={errors.name}
              autoComplete="name"
            />

            {/* ------------------------------------------------ */}
            {/* Email */}
            {/* ------------------------------------------------ */}

            <View>
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-[#64806C] text-xs font-semibold ml-0.5">
                  University email
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setShowHint((h) => !h)
                  }
                  className="flex-row items-center gap-1"
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color="#6B8A74"
                  />

                  <Text className="text-[#64806C] text-xs font-medium">
                    Supported formats
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Animated Hint */}

              {showHint && (
                <Animated.View
                  style={{
                    opacity: hintHeight,
                    transform: [
                      {
                        translateY: hintHeight.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-5, 0],
                        }),
                      },
                    ],
                  }}
                  className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-3 mb-2"
                >
                  <View className="flex-row items-start">
                    <Ionicons
                      name="school-outline"
                      size={16}
                      color="#16A34A"
                      style={{
                        marginTop: 1,
                        marginRight: 8,
                      }}
                    />

                    <Text className="text-[#64806C] text-xs leading-5 flex-1">
                      {UNIVERSITY_HINT}
                    </Text>
                  </View>
                </Animated.View>
              )}

              <Input
                placeholder="your@university.edu"
                leftIcon="mail-outline"
                value={form.email}
                onChangeText={set("email")}
                error={errors.email}
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* ------------------------------------------------ */}
            {/* Password */}
            {/* ------------------------------------------------ */}

            <Input
              label="Password"
              placeholder="Min. 6 characters"
              leftIcon="lock-closed-outline"
              isPassword
              value={form.password}
              onChangeText={set("password")}
              error={errors.password}
            />

            {/* ------------------------------------------------ */}
            {/* Confirm Password */}
            {/* ------------------------------------------------ */}

            <Input
              label="Confirm password"
              placeholder="Re-enter password"
              leftIcon="shield-checkmark-outline"
              isPassword
              value={form.confirm}
              onChangeText={set("confirm")}
              error={errors.confirm}
            />

            {/* ------------------------------------------------ */}
            {/* Create Account Button */}
            {/* ------------------------------------------------ */}

            <Animated.View
              style={{
                transform: [
                  {
                    scale: buttonScale,
                  },
                ],
              }}
              className="mt-2"
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleRegister}
                onPressIn={pressIn}
                onPressOut={pressOut}
                disabled={loading}
              >
                <Button
                  label="Create account"
                  onPress={handleRegister}
                  loading={loading}
                  size="lg"
                  className="mb-4"
                />
              </TouchableOpacity>
            </Animated.View>

            {/* ------------------------------------------------ */}
            {/* Sign In */}
            {/* ------------------------------------------------ */}

            <View className="flex-row justify-center items-center mt-1">
              <Text className="text-[#64806C] text-sm">
                Already have an account?
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.push("/(auth)/login")
                }
                className="ml-1.5 px-1"
              >
                <Text className="text-[#166534] text-sm font-bold">
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ------------------------------------------------ */}
          {/* Bottom Branding */}
          {/* ------------------------------------------------ */}

          <Text className="text-[#8AA394] text-[10px] text-center mt-7 tracking-[1.5px]">
            OWN LESS • ACCESS MORE
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
