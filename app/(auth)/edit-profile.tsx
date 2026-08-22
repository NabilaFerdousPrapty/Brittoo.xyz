import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  View
} from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = {
    name: "John Doe",
    email: "jone@gmail.com",
    phoneNumber: "+1234567890",

    roll: "123456",
    selfie: "https://via.placeholder.com/100",
  };

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
       <Text>
        Comming Soon
       </Text>
      </View>
    </ScrollView>
  );
}
