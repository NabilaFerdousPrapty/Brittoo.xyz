import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../../store/useAuthStore";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
  });
  const [newImage, setNewImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setLoading(true);
    // In a real app, upload image and update profile
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);

    Alert.alert("Success", "Profile updated successfully", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Profile Image */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={pickImage} className="relative">
            <Image
              source={{
                uri:
                  newImage || user?.selfie || "https://via.placeholder.com/100",
              }}
              className="w-28 h-28 rounded-full"
            />
            <View className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2">
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-gray-500 text-sm mt-2">
            Tap to change photo
          </Text>
        </View>

        {/* Form */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Full Name</Text>
          <TextInput
            className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter your name"
          />
        </View>

        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Email</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 border border-gray-200 text-gray-500"
            value={user?.email}
            editable={false}
          />
          <Text className="text-gray-400 text-xs mt-1">
            Email cannot be changed
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Phone Number</Text>
          <TextInput
            className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
            value={formData.phoneNumber}
            onChangeText={(text) =>
              setFormData({ ...formData, phoneNumber: text })
            }
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Roll Number</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 border border-gray-200 text-gray-500"
            value={user?.roll}
            editable={false}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-green-500 py-4 rounded-xl mb-4"
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
