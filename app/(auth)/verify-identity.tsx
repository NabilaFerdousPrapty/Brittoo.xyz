import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { Button } from "../../components/button";
import { verifyUserDocuments } from "../hooks/api";
import { STORAGE_KEYS } from "../../constants";

export default function VerifyIdentityScreen() {
  const [idCard, setIdCard] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (setter: (uri: string) => void, camera = false) => {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please grant permission to continue");
      return;
    }

    const result = camera
      ? await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
        });

    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  };

  const handleImageOptions = (setter: (uri: string) => void, label: string) => {
    Alert.alert(`Upload ${label}`, "Choose source", [
      { text: "Camera", onPress: () => pickImage(setter, true) },
      { text: "Gallery", onPress: () => pickImage(setter, false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    if (!idCard || !selfie) {
      Alert.alert(
        "Missing Files",
        "Please upload both your ID card and a selfie",
      );
      return;
    }
    const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    if (!userStr) {
      router.replace("/(auth)/login");
      return;
    }
    const user = JSON.parse(userStr);

    setLoading(true);
    try {
      const res = await verifyUserDocuments(user.email, idCard, selfie);
      if (res.data.success) {
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER,
          JSON.stringify(res.data.user),
        );
        Alert.alert(
          "✅ Submitted!",
          "Your documents are under review. We'll notify you once verified.",
          [{ text: "OK", onPress: () => router.replace("/dashboard") }],
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({
    label,
    icon,
    uri,
    onPress,
    hint,
  }: {
    label: string;
    icon: string;
    uri: string | null;
    onPress: () => void;
    hint: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`border-2 border-dashed rounded-2xl overflow-hidden ${uri ? "border-[#6c63ff]" : "border-[#2a2a40]"}`}
    >
      {uri ? (
        <View className="relative">
          <Image source={{ uri }} className="w-full h-44" resizeMode="cover" />
          <View className="absolute top-2 right-2 bg-[#6c63ff] rounded-full p-1">
            <Ionicons name="checkmark" size={14} color="white" />
          </View>
          <TouchableOpacity
            onPress={onPress}
            className="absolute bottom-2 right-2 bg-black/60 rounded-lg px-3 py-1"
          >
            <Text className="text-white text-xs">Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="bg-[#12121f] p-8 items-center gap-3">
          <View className="w-14 h-14 bg-[#6c63ff]/10 rounded-2xl items-center justify-center">
            <Ionicons name={icon as any} size={24} color="#6c63ff" />
          </View>
          <Text className="text-[#f1f5f9] font-semibold text-sm">{label}</Text>
          <Text className="text-[#6b7280] text-xs text-center">{hint}</Text>
          <View className="bg-[#6c63ff]/10 border border-[#6c63ff]/30 rounded-lg px-4 py-2">
            <Text className="text-[#6c63ff] text-sm font-medium">Upload</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      className="flex-1 bg-[#0a0a14]"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 px-6 pt-14 pb-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 self-start"
        >
          <Ionicons name="arrow-back" size={24} color="#6c63ff" />
        </TouchableOpacity>

        <Text className="text-[#f1f5f9] text-3xl font-bold mb-2">
          Verify Identity
        </Text>
        <Text className="text-[#6b7280] text-sm mb-8 leading-6">
          Upload your university ID card and a selfie to get verified on Brittoo
        </Text>

        {/* Status banner */}
        <View className="bg-[#6c63ff]/10 border border-[#6c63ff]/30 rounded-xl p-4 mb-8">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color="#6c63ff"
            />
            <Text className="text-[#8b84ff] font-semibold text-sm">
              Verification Process
            </Text>
          </View>
          <Text className="text-[#6b7280] text-xs leading-5">
            Your documents are reviewed manually within 24-48 hours. We verify
            you're a real student before granting full access.
          </Text>
        </View>

        <View className="gap-4 mb-8">
          <UploadBox
            label="University ID Card"
            icon="card-outline"
            uri={idCard}
            onPress={() => handleImageOptions(setIdCard, "ID Card")}
            hint="Front side of your student ID • Max 10MB"
          />
          <UploadBox
            label="Selfie Photo"
            icon="camera-outline"
            uri={selfie}
            onPress={() => handleImageOptions(setSelfie, "Selfie")}
            hint="Clear photo of your face • Look straight at camera"
          />
        </View>

        {/* Tips */}
        <View className="bg-[#1a1a2e] border border-[#2a2a40] rounded-xl p-4 mb-8">
          <Text className="text-[#94a3b8] text-xs font-semibold mb-3 uppercase tracking-wider">
            Tips for approval
          </Text>
          {[
            "Ensure all text on your ID is clearly readable",
            "Take your selfie in good lighting",
            "Your face should match the ID photo",
            "Only JPG/PNG images accepted",
          ].map((tip) => (
            <View key={tip} className="flex-row items-start gap-2 mb-1.5">
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#00d4aa"
                style={{ marginTop: 1 }}
              />
              <Text className="text-[#6b7280] text-xs flex-1">{tip}</Text>
            </View>
          ))}
        </View>

        <Button
          label="Submit for Verification"
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          disabled={!idCard || !selfie}
        />
      </View>
    </ScrollView>
  );
}
