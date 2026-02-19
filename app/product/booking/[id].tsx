import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useProductStore } from "../../../store/useProductStore";
import { useAuthStore } from "../../../store/useAuthStore";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import { Calendar } from "react-native-calendars";

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { products } = useProductStore();
  const { isAuthenticated } = useAuthStore();

  const product = products.find((p) => p.id === id);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDates, setSelectedDates] = useState<{
    [key: string]: any;
  }>({});

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Product not found</Text>
      </View>
    );
  }

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days * product.price;
  };

  const handleDateSelect = (day: any) => {
    if (!startDate) {
      setStartDate(day.dateString);
      setSelectedDates({
        [day.dateString]: {
          startingDay: true,
          color: "#3B82F6",
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
          color: "#3B82F6",
          textColor: "white",
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      marked[startDate] = {
        startingDay: true,
        color: "#3B82F6",
        textColor: "white",
      };

      marked[day.dateString] = {
        endingDay: true,
        color: "#3B82F6",
        textColor: "white",
      };

      setSelectedDates(marked);
    } else {
      // Reset selection
      setStartDate(day.dateString);
      setEndDate("");
      setSelectedDates({
        [day.dateString]: {
          startingDay: true,
          color: "#3B82F6",
          textColor: "white",
        },
      });
    }
  };

  const handleBooking = () => {
    // In a real app, this would create a booking
    alert("Booking confirmed!");
    router.back();
  };

  const total = calculateTotal();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-2xl">← Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold mb-2">Book {product.title}</Text>
        <Text className="text-gray-600 mb-6">
          ${product.price} per {product.priceUnit}
        </Text>

        {/* Calendar */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-4">Select Dates</Text>
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={selectedDates}
            minDate={new Date().toISOString().split("T")[0]}
            theme={{
              todayTextColor: "#3B82F6",
              selectedDayBackgroundColor: "#3B82F6",
              arrowColor: "#3B82F6",
            }}
          />
        </View>

        {/* Booking Summary */}
        {startDate && endDate && (
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <Text className="text-lg font-semibold mb-3">Booking Summary</Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Start Date:</Text>
              <Text className="font-medium">{startDate}</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">End Date:</Text>
              <Text className="font-medium">{endDate}</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Duration:</Text>
              <Text className="font-medium">
                {Math.ceil(
                  (new Date(endDate).getTime() -
                    new Date(startDate).getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                days
              </Text>
            </View>

            <View className="flex-row justify-between pt-3 border-t border-gray-200 mt-2">
              <Text className="text-lg font-semibold">Total:</Text>
              <Text className="text-lg font-bold text-green-600">${total}</Text>
            </View>
          </View>
        )}

        {/* Contact Info */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-4">
            Contact Information
          </Text>

          <Input placeholder="Your phone number" keyboardType="phone-pad" />

          <Input placeholder="Additional notes" multiline numberOfLines={3} />
        </View>

        {/* Book Button */}
        <Button
          title="Confirm Booking"
          onPress={handleBooking}
          size="lg"
          disabled={!startDate || !endDate}
        />

        <Text className="text-center text-gray-500 text-sm mt-4">
          You won't be charged yet
        </Text>
      </View>
    </ScrollView>
  );
}
