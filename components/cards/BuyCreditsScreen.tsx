import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface CreditFeature {
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface CreditCardProps {
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  gradientFrom: string;
  gradientTo: string;
  lightBg: string;
  features: CreditFeature[];
  buttonText: string;
  buttonIcon: keyof typeof Ionicons.glyphMap;
  isRed?: boolean;
  amount: number;
  issuedAt: string;
  validTill: string;
  onPress: () => void;
}

const CreditCard = ({
  title,
  subtitle,
  description,
  longDescription,
  gradientFrom,
  gradientTo,
  lightBg,
  features,
  buttonText,
  buttonIcon,
  isRed,
  amount,
  issuedAt,
  validTill,
  onPress,
}: CreditCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    Animated.spring(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View
      className="rounded-2xl mb-6 overflow-hidden bg-white border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      {/* Card Header with Gradient */}
      <LinearGradient
        colors={[gradientFrom, gradientTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5"
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text className="text-3xl font-bold text-white mr-2">
                {title}
              </Text>
              <View className="bg-white/20 px-2.5 py-1 rounded-full">
                <Text className="text-white text-[9px] font-semibold tracking-wider">
                  {subtitle}
                </Text>
              </View>
            </View>
            <Text className="text-white/90 text-sm leading-5">
              {description}
            </Text>
          </View>

          {/* Icon */}
          <View className="opacity-30">
            <MaterialCommunityIcons
              name={isRed ? "fire" : "water"}
              size={48}
              color="white"
            />
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View className="p-5">
        {/* Long Description */}
        <Text className="text-gray-600 text-sm leading-5 mb-5">
          {longDescription}
        </Text>

        {/* Credit Amount Card */}
        <LinearGradient
          colors={[gradientFrom, gradientTo]}
          className="rounded-xl p-4 mb-5"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            shadowColor: gradientFrom,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white/80 text-xs font-medium">CC Amount</Text>
            <View className="bg-white/20 rounded-full px-3 py-1">
              <Text className="text-white text-xs">৳ BDT</Text>
            </View>
          </View>

          <Text className="text-white text-3xl font-bold mb-4">
            ৳{amount.toLocaleString()}
          </Text>

          <View className="flex-row justify-between">
            <View>
              <Text className="text-white/60 text-[10px]">Issued At</Text>
              <Text className="text-white text-sm font-semibold">
                {issuedAt}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-white/60 text-[10px]">Valid Till</Text>
              <Text className="text-white text-sm font-semibold">
                {validTill}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={toggleExpand}
            className="flex-row justify-between items-center py-3 border-t border-gray-100"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <LinearGradient
                colors={[gradientFrom, gradientTo]}
                className="w-5 h-5 rounded-md mr-2.5"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text className="text-base font-bold text-gray-800">
                Features of {title} :
              </Text>
            </View>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="chevron-down" size={22} color="#9ca3af" />
            </Animated.View>
          </TouchableOpacity>

          <Animated.View
            style={[
              { overflow: "hidden" },
              { maxHeight: isExpanded ? 300 : 0 },
            ]}
          >
            <View className="pt-2 pb-1">
              {features.map((feature, index) => (
                <View key={index} className="flex-row items-start mb-3">
                  <Text className="text-green-600 font-bold mr-2">·</Text>
                  <View className="flex-1 flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-lg justify-center items-center mr-2"
                      style={{ backgroundColor: lightBg }}
                    >
                      <Ionicons
                        name={feature.icon}
                        size={14}
                        color={gradientFrom}
                      />
                    </View>
                    <Text className="flex-1 text-sm text-gray-700 leading-5">
                      {feature.text}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          className="rounded-xl overflow-hidden mt-2"
          onPress={onPress}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[gradientFrom, gradientTo]}
            className="flex-row h-14 justify-center items-center"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text className="text-white font-bold text-base mr-2 tracking-wide">
              {buttonText}
            </Text>
            <Ionicons name={buttonIcon} size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function BuyCreditsScreen() {
  const handleBlueCreditPress = () => {
    console.log("Navigate to buy blue credits");
  };

  const handleRedCreditPress = () => {
    console.log("Navigate to earn red credits");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-8"
      >
        {/* Main Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Buy Credits & Start Your Rental Journey
          </Text>
          <Text className="text-sm text-gray-600 leading-5">
            Choose from RED or Blue Credits to access a seamless rental
            experience. Whether you're earning from your unused items or renting
            what you need, our credit system makes it simple, secure, and
            efficient. Start today and unlock the full potential of peer-to-peer
            rentals.
          </Text>
        </View>

        {/* Blue Credit Card */}
        <CreditCard
          title="BCC"
          subtitle="BLUE CACHE CREDIT"
          description="Blue Credits are purchased with money via online payment methods such as bKash or Nagad."
          longDescription="To acquire Blue Credits, simply make a payment to the designated account, then complete the form with the payment amount and transaction ID. Credits will be added to your account within 1-2 hours. These credits can be reconverted to cash once your rental period ends."
          gradientFrom="#000080"
          gradientTo="#0000cd"
          lightBg="#e0e7ff"
          amount={5000}
          issuedAt="10/06/25"
          validTill="Unlimited"
          buttonText="Get BCC Now"
          buttonIcon="wallet-outline"
          features={[
            { text: "Unlimited Validity", icon: "infinite-outline" },
            {
              text: "Your Money Our Responsibility",
              icon: "shield-checkmark-outline",
            },
            {
              text: "No Hassle of Product transportation",
              icon: "car-outline",
            },
            {
              text: "No Service Charge for Collateral Product.",
              icon: "cash-outline",
            },
            { text: "Withdraw Anytime", icon: "repeat-outline" },
          ]}
          onPress={handleBlueCreditPress}
        />

        {/* Red Credit Card */}
        <CreditCard
          title="RCC"
          subtitle="RED CACHE CREDIT"
          isRed
          description="RED Credits are awarded when users deposit products or when their listed products are successfully rented, based on the item's second-hand value."
          longDescription="These credits are valid for the duration of the rental period and are ideal for maximizing the value of owned items through rentals. Please note that RED Credits are not redeemable for cash."
          gradientFrom="#dc2626"
          gradientTo="#b91c1c"
          lightBg="#fef2f2"
          amount={5000}
          issuedAt="10/06/25"
          validTill="14/6/25"
          buttonText="List Items & Get RCC"
          buttonIcon="add-circle-outline"
          features={[
            { text: "Limited Validity", icon: "time-outline" },
            {
              text: "Earn by depositing or renting your products",
              icon: "trending-up-outline",
            },
            {
              text: "Maximizes value of your unused items",
              icon: "repeat-outline",
            },
            {
              text: "No cash conversion available",
              icon: "close-circle-outline",
            },
            {
              text: "Ideal for peer-to-peer rental leverage",
              icon: "people-outline",
            },
          ]}
          onPress={handleRedCreditPress}
        />

        {/* Payment Methods Section */}
        <View className="bg-white rounded-2xl p-5 mt-2 border border-gray-100">
          <Text className="text-base font-bold text-gray-800 mb-3">
            Accepted Payment Methods
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <View className="w-14 h-14 bg-[#E2136E] rounded-xl items-center justify-center mb-2 shadow-sm">
                <Text className="text-white font-bold text-xs">bKash</Text>
              </View>
              <Text className="text-xs text-gray-600">bKash</Text>
            </View>
            <View className="items-center">
              <View className="w-14 h-14 bg-[#FDB913] rounded-xl items-center justify-center mb-2 shadow-sm">
                <Text className="text-white font-bold text-xs">Nagad</Text>
              </View>
              <Text className="text-xs text-gray-600">Nagad</Text>
            </View>
            <View className="items-center">
              <View className="w-14 h-14 bg-[#229D4D] rounded-xl items-center justify-center mb-2 shadow-sm">
                <Text className="text-white font-bold text-xs">Rocket</Text>
              </View>
              <Text className="text-xs text-gray-600">Rocket</Text>
            </View>
            <View className="items-center">
              <View className="w-14 h-14 bg-blue-600 rounded-xl items-center justify-center mb-2 shadow-sm">
                <Text className="text-white font-bold text-xs">VISA</Text>
              </View>
              <Text className="text-xs text-gray-600">Cards</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
