import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AuthModal from "../../components/common/AuthModal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { categories } from "../../constants/categories";
import { useAuthStore } from "../../store/useAuthStore";

export default function AddItemScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState<"day" | "week" | "month">("day");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, []);

  const handleAddImage = () => {
    // In a real app, this would open image picker
    Alert.alert("Demo", "Image picker would open here");
  };

  const handleSubmit = () => {
    Alert.alert("Success", "Item listed successfully!");
    router.back();
  };

  if (!isAuthenticated) {
    return (
      <AuthModal
        visible={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          router.back();
        }}
        message="Please login to list an item"
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">List Your Item</Text>

        {/* Image Upload */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-medium">Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={handleAddImage}
              className="w-24 h-24 bg-gray-100 rounded-lg items-center justify-center mr-3"
            >
              <Text className="text-3xl text-gray-400">+</Text>
            </TouchableOpacity>
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                className="w-24 h-24 rounded-lg mr-3"
              />
            ))}
          </ScrollView>
        </View>

        <Input
          label="Title"
          placeholder="e.g., Sony A7III Camera"
          value={title}
          onChangeText={setTitle}
        />

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Description</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Describe your item..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View className="flex-row space-x-4 mb-4">
          <View className="flex-1">
            <Text className="text-gray-700 mb-2 font-medium">Price</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 mb-2 font-medium">Per</Text>
            <View className="flex-row border border-gray-300 rounded-lg overflow-hidden">
              {(["day", "week", "month"] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => setPriceUnit(unit)}
                  className={`flex-1 py-3 ${priceUnit === unit ? "bg-blue-500" : "bg-white"}`}
                >
                  <Text
                    className={`text-center capitalize ${priceUnit === unit ? "text-white" : "text-gray-700"}`}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.name)}
                className={`px-4 py-2 rounded-full mr-3 ${
                  category === cat.name ? "bg-blue-500" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`${category === cat.name ? "text-white" : "text-gray-700"}`}
                >
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Input
          label="Location"
          placeholder="e.g., New York, NY"
          value={location}
          onChangeText={setLocation}
        />

        <Button
          title="List Item"
          onPress={handleSubmit}
          size="lg"
          className="mt-6"
        />
      </View>
    </ScrollView>
  );
}
