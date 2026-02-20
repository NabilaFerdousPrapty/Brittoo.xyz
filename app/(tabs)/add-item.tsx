import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Check authentication on mount
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }

    // Request permissions on mount using the modern approach
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload images!",
          [{ text: "OK" }],
        );
      }
    })();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [isAuthenticated]);

  const pickMultipleImages = async () => {
    try {
      // Check permissions first
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please grant camera roll permissions to upload images.",
            [{ text: "OK" }],
          );
          return;
        }
      }

      const remainingSlots = 5 - images.length;

      // Multiple image selection - NO editing (editing not supported with multiple selection)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false, // Must be false when allowsMultipleSelection is true
        quality: 0.8,
        base64: false,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets) {
        setIsUploading(true);

        // Simulate upload delay (remove this in production)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newImages = result.assets.map((asset) => asset.uri);
        setImages([...images, ...newImages]);
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images. Please try again.");
      setIsUploading(false);
    }
  };

  const pickSingleImage = async () => {
    try {
      // Check permissions first
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please grant camera roll permissions to upload images.",
            [{ text: "OK" }],
          );
          return;
        }
      }

      // Single image selection with editing enabled
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true, // Editing is supported for single selection
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
        allowsMultipleSelection: false, // Must be false when allowsEditing is true
      });

      if (!result.canceled && result.assets) {
        setIsUploading(true);

        // Simulate upload delay (remove this in production)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setImages([...images, result.assets[0].uri]);
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    try {
      // Check camera permissions
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please grant camera permissions to take photos.",
            [{ text: "OK" }],
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets) {
        setIsUploading(true);

        // Simulate upload delay (remove this in production)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setImages([...images, result.assets[0].uri]);
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
      setIsUploading(false);
    }
  };

  const showImagePickerOptions = () => {
    const remainingSlots = 5 - images.length;

    // Create options array based on remaining slots
    const options = [
      {
        text: "Take Photo",
        onPress: takePhoto,
      },
    ];

    // Add library options based on remaining slots
    if (remainingSlots === 1) {
      options.push({
        text: "Choose from Library (with editing)",
        onPress: pickSingleImage,
      });
    } else if (remainingSlots > 1) {
      options.push({
        text: `Choose Multiple Photos (${remainingSlots} max, no editing)`,
        onPress: pickMultipleImages,
      });
      options.push({
        text: "Choose Single Photo (with editing)",
        onPress: pickSingleImage,
      });
    }

    options.push({
      text: "Cancel",
      style: "cancel",
    });

    Alert.alert(
      "Add Photos",
      `Select an option (${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""} remaining)`,
      options,
      { cancelable: true },
    );
  };

  const removeImage = (index: number) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const newImages = [...images];
          newImages.splice(index, 1);
          setImages(newImages);
        },
      },
    ]);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!title.trim()) errors.title = "Title is required";
    if (!description.trim()) errors.description = "Description is required";
    if (!price) errors.price = "Price is required";
    else if (isNaN(Number(price)) || Number(price) <= 0) {
      errors.price = "Please enter a valid price";
    }
    if (!category) errors.category = "Please select a category";
    if (!location.trim()) errors.location = "Location is required";
    if (images.length === 0) errors.images = "Please add at least one photo";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Here you would typically send the data to your backend
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("priceUnit", priceUnit);
      formData.append("category", category);
      formData.append("location", location);

      // Append images
      images.forEach((image, index) => {
        formData.append("images", {
          uri: image,
          type: "image/jpeg",
          name: `image_${index}.jpg`,
        } as any);
      });

      // In production, send formData to your API
      console.log("Submitting:", {
        title,
        description,
        price,
        priceUnit,
        category,
        location,
        images,
      });

      Alert.alert("Success", "Your item has been listed successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    }
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    router.push("/(auth)/login");
  };

  // If not authenticated, show auth modal and prevent form rendering
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white">
        <AuthModal
          visible={showAuthModal}
          onClose={handleAuthModalClose}
          message="Please login to list an item"
        />
        <View className="flex-1 justify-center items-center bg-gray-50">
          <Ionicons name="lock-closed" size={50} color="#9CA3AF" />
          <Text className="text-gray-500 mt-4">Authentication required</Text>
          <Text className="text-gray-400 text-sm text-center px-8 mt-2">
            You need to be logged in to list items
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            className="mt-6 bg-green-500 px-8 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      {/* Header with back button */}
      <View className="flex-row items-center px-4 pt-12 pb-2 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-bold text-gray-800 text-center mr-10">
          List Your Item
        </Text>
      </View>

      <View className="p-5">
        {/* Progress Steps */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1 items-center">
            <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center">
              <Text className="text-white text-sm font-bold">1</Text>
            </View>
            <Text className="text-xs text-green-600 mt-1">Details</Text>
          </View>
          <View className="w-8 h-[2px] bg-gray-300" />
          <View className="flex-1 items-center">
            <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center">
              <Text className="text-gray-600 text-sm font-bold">2</Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">Photos</Text>
          </View>
          <View className="w-8 h-[2px] bg-gray-300" />
          <View className="flex-1 items-center">
            <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center">
              <Text className="text-gray-600 text-sm font-bold">3</Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">Review</Text>
          </View>
        </View>

        {/* Image Upload Section */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-semibold">
            Photos <Text className="text-red-500">*</Text>
          </Text>
          <Text className="text-gray-500 text-xs mb-3">
            Add up to 5 photos of your item
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Add Image Button */}
            <TouchableOpacity
              onPress={showImagePickerOptions}
              className="w-24 h-24 bg-gray-100 rounded-xl items-center justify-center mr-3 border-2 border-dashed border-gray-300"
              disabled={images.length >= 5 || isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={30} color="#9CA3AF" />
                  <Text className="text-xs text-gray-500 mt-1">
                    {images.length}/5
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Image Previews */}
            {images.map((img, index) => (
              <View key={index} className="relative mr-3">
                <Image source={{ uri: img }} className="w-24 h-24 rounded-xl" />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
                <View className="absolute bottom-1 left-1 bg-black/50 rounded-full px-2 py-0.5">
                  <Text className="text-white text-xs">{index + 1}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          {formErrors.images && (
            <Text className="text-red-500 text-xs mt-1">
              {formErrors.images}
            </Text>
          )}
        </View>

        {/* Basic Info */}
        <View className="mb-4">
          <Input
            label="Title"
            placeholder="e.g., Sony A7III Camera"
            value={title}
            onChangeText={setTitle}
            error={formErrors.title}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            Description <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={`border ${formErrors.description ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 text-base bg-white min-h-[100px]`}
            placeholder="Describe your item's condition, features, and any other details..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text className="text-right text-xs text-gray-400 mt-1">
            {description.length}/500
          </Text>
          {formErrors.description && (
            <Text className="text-red-500 text-xs mt-1">
              {formErrors.description}
            </Text>
          )}
        </View>

        {/* Price Section */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            Price <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <View className="flex-row items-center border border-gray-300 rounded-xl bg-white">
                <Text className="text-gray-500 pl-3">$</Text>
                <TextInput
                  className="flex-1 px-2 py-3 text-base"
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
              {formErrors.price && (
                <Text className="text-red-500 text-xs mt-1">
                  {formErrors.price}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <View className="flex-row border border-gray-300 rounded-xl overflow-hidden bg-white">
                {(["day", "week", "month"] as const).map((unit, index) => (
                  <TouchableOpacity
                    key={unit}
                    onPress={() => setPriceUnit(unit)}
                    className={`flex-1 py-3 ${
                      priceUnit === unit
                        ? "bg-green-500"
                        : index === 0
                          ? "bg-white"
                          : "bg-white"
                    }`}
                  >
                    <Text
                      className={`text-center capitalize ${
                        priceUnit === unit
                          ? "text-white font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Category Selection */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">
            Category <Text className="text-red-500">*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.name)}
                className={`px-5 py-3 rounded-full mr-3 flex-row items-center ${
                  category === cat.name ? "bg-green-500" : "bg-gray-100"
                }`}
              >
                <Text className="mr-2">{cat.icon}</Text>
                <Text
                  className={`font-medium ${
                    category === cat.name ? "text-white" : "text-gray-700"
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {formErrors.category && (
            <Text className="text-red-500 text-xs mt-1">
              {formErrors.category}
            </Text>
          )}
        </View>

        {/* Location */}
        <View className="mb-6">
          <Input
            label="Location"
            placeholder="e.g., New York, NY"
            value={location}
            onChangeText={setLocation}
            error={formErrors.location}
          />
        </View>

        {/* Terms and Conditions */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity className="w-5 h-5 border-2 border-gray-300 rounded mr-2 items-center justify-center">
            <Ionicons name="checkmark" size={16} color="#10B981" />
          </TouchableOpacity>
          <Text className="text-gray-600 text-sm flex-1">
            I agree to the{" "}
            <Text className="text-green-600">Terms of Service</Text> and{" "}
            <Text className="text-green-600">Rental Guidelines</Text>
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title="List Item"
          onPress={handleSubmit}
          size="lg"
          className="bg-green-500"
          disabled={isUploading}
        />

        {/* Cancel Button */}
        <TouchableOpacity onPress={() => router.back()} className="mt-3 py-3">
          <Text className="text-center text-gray-500">Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
