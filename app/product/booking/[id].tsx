import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import { useAuthStore } from "../../../store/useAuthStore";
import { useProductStore } from "../../../store/useProductStore";

const { width } = Dimensions.get("window");

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { products } = useProductStore();
  const { isAuthenticated, user } = useAuthStore();

  const product = products.find((p) => p.id === id);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDates, setSelectedDates] = useState<{
    [key: string]: any;
  }>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credits">(
    "cash",
  );

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-600 mt-4 text-lg">Product not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-green-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    return calculateDays() * product.price;
  };

  const handleDateSelect = (day: any) => {
    if (!startDate) {
      setStartDate(day.dateString);
      setSelectedDates({
        [day.dateString]: {
          startingDay: true,
          color: "#10B981",
          textColor: "white",
        },
      });
    } else if (!endDate && new Date(day.dateString) > new Date(startDate)) {
      setEndDate(day.dateString);

      // Mark all dates between start and end
      const marked: any = {};
      let currentDate = new Date(startDate);
      const endDateTime = new Date(day.dateString);

      while (currentDate <= endDateTime) {
        const dateStr = currentDate.toISOString().split("T")[0];
        marked[dateStr] = {
          color: "#10B981",
          textColor: "white",
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      marked[startDate] = {
        startingDay: true,
        color: "#10B981",
        textColor: "white",
      };

      marked[day.dateString] = {
        endingDay: true,
        color: "#10B981",
        textColor: "white",
      };

      setSelectedDates(marked);
      setCurrentStep(2);
    } else {
      // Reset selection
      setStartDate(day.dateString);
      setEndDate("");
      setSelectedDates({
        [day.dateString]: {
          startingDay: true,
          color: "#10B981",
          textColor: "white",
        },
      });
    }
  };

  const handleBooking = () => {
    Alert.alert(
      "Booking Confirmed! 🎉",
      "Your rental has been booked successfully. You'll receive a confirmation message shortly.",
      [
        {
          text: "View Bookings",
          onPress: () => router.push("/(tabs)/profile?tab=bookings"),
        },
        {
          text: "Go Home",
          onPress: () => router.push("/(tabs)"),
          style: "cancel",
        },
      ],
    );
  };

  const days = calculateDays();
  const total = calculateTotal();

  const steps = [
    { number: 1, title: "Select Dates", icon: "calendar-outline" },
    { number: 2, title: "Contact Info", icon: "person-outline" },
    { number: 3, title: "Payment", icon: "card-outline" },
  ];

  return (
    <>
      <LinearGradient
        colors={["#059669", "#10B981"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="pt-12 pb-6 px-5"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">
            Book Your Rental
          </Text>
          <View className="w-10" />
        </View>

        {/* Progress Steps */}
        <View className="flex-row justify-between mt-6 px-2">
          {steps.map((step, index) => (
            <View key={step.number} className="items-center flex-1">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  currentStep >= step.number ? "bg-white" : "bg-white/30"
                }`}
              >
                <Ionicons
                  name={step.icon as any}
                  size={20}
                  color={currentStep >= step.number ? "#059669" : "white"}
                />
              </View>
              <Text
                className={`text-xs mt-2 ${
                  currentStep >= step.number
                    ? "text-white font-semibold"
                    : "text-white/70"
                }`}
              >
                {step.title}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
      >
        <View className="p-5">
          {/* Product Summary Card */}
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
            <View className="flex-row">
              <View className="w-20 h-20 bg-gray-100 rounded-xl items-center justify-center">
                <Ionicons name="image-outline" size={32} color="#9CA3AF" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold text-gray-900">
                  {product.title}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {product.location}
                </Text>
                <View className="flex-row items-center mt-2">
                  <View className="bg-green-50 px-2 py-1 rounded-full">
                    <Text className="text-green-600 font-semibold">
                      ${product.price}/{product.priceUnit}
                    </Text>
                  </View>
                  <View className="flex-row items-center ml-2">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-gray-600 text-sm ml-1">
                      {product.rating} ({product.reviewsCount})
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Step 1: Calendar */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                <Text className="text-green-600 font-bold">1</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-900">
                Select Rental Dates
              </Text>
            </View>

            <Calendar
              onDayPress={handleDateSelect}
              markedDates={selectedDates}
              minDate={new Date().toISOString().split("T")[0]}
              theme={{
                todayTextColor: "#10B981",
                selectedDayBackgroundColor: "#10B981",
                arrowColor: "#10B981",
                dotColor: "#10B981",
                selectedDotColor: "#ffffff",
                monthTextColor: "#374151",
                textMonthFontWeight: "bold",
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14,
              }}
              style={{
                borderRadius: 16,
              }}
            />

            {startDate && !endDate && (
              <View className="mt-4 bg-green-50 p-3 rounded-xl">
                <Text className="text-green-700 text-center">
                  Now select your end date
                </Text>
              </View>
            )}
          </View>

          {/* Step 2: Contact Information */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                <Text className="text-green-600 font-bold">2</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-900">
                Contact Information
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
                  Full Name
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                  </View>
                  <Input
                    placeholder="Your full name"
                    value={user?.name || ""}
                    editable={false}
                    className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
                  Email Address
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                  </View>
                  <Input
                    placeholder="Your email"
                    value={user?.email || ""}
                    editable={false}
                    className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
                  Phone Number <Text className="text-red-500">*</Text>
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Ionicons name="call-outline" size={18} color="#9CA3AF" />
                  </View>
                  <Input
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
                  Additional Notes
                </Text>
                <Input
                  placeholder="Any special requests or notes for the owner..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                />
              </View>
            </View>
          </View>

          {/* Step 3: Payment Method */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                <Text className="text-green-600 font-bold">3</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-900">
                Payment Method
              </Text>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setPaymentMethod("cash")}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  paymentMethod === "cash"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <Ionicons
                  name="cash-outline"
                  size={28}
                  color={paymentMethod === "cash" ? "#10B981" : "#6B7280"}
                />
                <Text
                  className={`font-semibold mt-2 ${
                    paymentMethod === "cash"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  Cash Payment
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  Pay with cash deposit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPaymentMethod("credits")}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  paymentMethod === "credits"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <Ionicons
                  name="wallet-outline"
                  size={28}
                  color={paymentMethod === "credits" ? "#10B981" : "#6B7280"}
                />
                <Text
                  className={`font-semibold mt-2 ${
                    paymentMethod === "credits"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  Pay with Credits
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  Use your earned credits
                </Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === "credits" && (
              <View className="mt-4 bg-blue-50 p-3 rounded-xl">
                <Text className="text-blue-700 text-sm">
                  You have 250 credits available
                </Text>
              </View>
            )}
          </View>

          {/* Booking Summary */}
          {startDate && endDate && (
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border-l-4 border-green-500">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Booking Summary
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Rental Period:</Text>
                  <Text className="font-medium text-gray-900">
                    {new Date(startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Duration:</Text>
                  <Text className="font-medium text-gray-900">
                    {days} {days === 1 ? "day" : "days"}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Price per day :</Text>
                  <Text className="font-medium text-gray-900">
                    ৳{product.price}
                  </Text>
                </View>

                {paymentMethod === "credits" && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Credits to use:</Text>
                    <Text className="font-medium text-green-600">
                      {total} credits
                    </Text>
                  </View>
                )}

                <View className="h-px bg-gray-200 my-2" />

                <View className="flex-row justify-between">
                  <Text className="text-lg font-bold text-gray-900">
                    Total:
                  </Text>
                  <Text className="text-2xl font-bold text-green-600">
                    ${total}
                  </Text>
                </View>

                <View className="bg-green-50 p-3 rounded-xl mt-2">
                  <Text className="text-green-700 text-xs text-center">
                    Security deposit of ${(total * 0.2).toFixed(0)} will be held
                    and returned after successful rental
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Book Button */}
          <View className="mb-8">
            <Button
              title="Confirm & Book Now"
              onPress={handleBooking}
              size="lg"
              disabled={!startDate || !endDate || !phoneNumber}
              className="bg-green-500 rounded-xl overflow-hidden"
            />

            <View className="flex-row items-center justify-center mt-4">
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#10B981"
              />
              <Text className="text-gray-500 text-xs ml-1">
                Your payment is secure and protected
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
