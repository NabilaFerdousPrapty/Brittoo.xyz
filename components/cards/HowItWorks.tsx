import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  Dimensions,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

type IconName = keyof typeof Ionicons.glyphMap;

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: IconName;
  color: string;
  index: number;
}

const Step = ({ number, title, description, icon, color, index }: StepProps) => (
  <Animated.View 
    entering={FadeInDown.delay(index * 100).duration(600)}
    className="flex-row mb-8"
  >
    <View className="mr-5 items-center">
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
        style={{ 
          backgroundColor: 'white', 
          borderWidth: 1, 
          borderColor: `${color}20`,
        }}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>
      {number !== 4 && (
        <View 
          className="w-[1.5px] flex-1 my-2" 
          style={{ backgroundColor: `${color}20` }} 
        />
      )}
    </View>
    <View className="flex-1 pt-1">
      <Text 
        className="text-[10px] font-bold uppercase tracking-[2px] mb-1"
        style={{ color: color }}
      >
        Step {number}
      </Text>
      <Text className="text-lg font-bold text-slate-900 mb-1">{title}</Text>
      <Text className="text-slate-500 leading-5 text-sm">{description}</Text>
    </View>
  </Animated.View>
);

interface FAQItemProps {
  question: string;
  answer: string;
  isLast?: boolean;
}

const FAQItem = ({ question, answer, isLast }: FAQItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className={`${!isLast ? "border-b border-slate-100" : ""}`}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        className="py-5 flex-row justify-between items-center"
        activeOpacity={0.7}
      >
        <Text className={`flex-1 font-semibold pr-4 ${expanded ? 'text-emerald-600' : 'text-slate-800'}`}>
          {question}
        </Text>
        <MotiView
          animate={{ rotate: expanded ? '180deg' : '0deg' }}
          transition={{ type: 'timing', duration: 300 }}
        >
          <Ionicons
            name="chevron-down"
            size={18}
            color={expanded ? "#10B981" : "#94a3b8"}
          />
        </MotiView>
      </TouchableOpacity>
      {expanded && (
        <MotiView 
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pb-5"
        >
          <Text className="text-slate-500 leading-6">{answer}</Text>
        </MotiView>
      )}
    </View>
  );
};

interface CreditCardProps {
  icon: IconName;
  title: string;
  description: string;
  color: string;
  index: number;
}

const CreditCard = ({ icon, title, description, color, index }: CreditCardProps) => (
  <Animated.View 
    entering={FadeInRight.delay(index * 200).duration(800)}
    className="bg-white rounded-[24px] p-5 flex-1 mx-1.5 border border-slate-50 shadow-sm"
  >
    <View
      className="w-10 h-10 rounded-xl items-center justify-center mb-4"
      style={{ backgroundColor: `${color}10` }}
    >
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text className="font-bold text-slate-900 mb-2 text-[13px]">{title}</Text>
    <Text className="text-[10px] text-slate-500 leading-4">{description}</Text>
  </Animated.View>
);

export default function HowItWorks() {
  const rentingSteps: Omit<StepProps, 'index'>[] = [
    { number: 1, title: "Browse Listings", description: "Explore our categorized and verified listings to find exactly what you need.", icon: "search-outline", color: "#3B82F6" },
    { number: 2, title: "Choose Payment", description: "Decide whether to pay with cash deposit or use your earned credits.", icon: "card-outline", color: "#8B5CF6" },
    { number: 3, title: "Arrange Pickup", description: "Coordinate with the owner for a convenient pickup location and time.", icon: "location-outline", color: "#EC4899" },
    { number: 4, title: "Return & Review", description: "Return the item in good condition and leave a review about your experience.", icon: "star-outline", color: "#F59E0B" },
  ];

  const listingSteps: Omit<StepProps, 'index'>[] = [
    { number: 1, title: "Create a Listing", description: "Add details, photos, and set your rental price or credit requirements.", icon: "create-outline", color: "#10B981" },
    { number: 2, title: "Get Verified", description: "Our team reviews your listing to ensure quality and accuracy.", icon: "shield-checkmark-outline", color: "#6366F1" },
    { number: 3, title: "Respond to Requests", description: "Accept rental requests and arrange item handover details.", icon: "chatbubbles-outline", color: "#F43F5E" },
    { number: 4, title: "Earn & Grow", description: "Collect cash or earn credits while building your trust profile.", icon: "trending-up-outline", color: "#14B8A6" },
  ];

  const creditCards: Omit<CreditCardProps, 'index'>[] = [
    { icon: "wallet-outline", title: "Earn Credits", description: "List items and earn credits when others rent them.", color: "#10B981" },
    { icon: "cart-outline", title: "Spend Credits", description: "Use credits to rent items without cash deposits.", color: "#8B5CF6" },
    { icon: "shield-checkmark-outline", title: "Gain Trust", description: "Build trust and earn badges for opportunities.", color: "#F59E0B" },
  ];

  const faqs: FAQItemProps[] = [
    { question: "How does the credit system work?", answer: "Our credit system allows you to earn credits by renting out your items. These credits can then be used to rent items from other users without paying cash. Credits are non-convertible to cash and are designed to encourage sharing within our community." },
    { question: "What happens if an item is damaged?", answer: "We have a damage waiver system in place. If an item is damaged during rental, the borrower is responsible. Depending on the selected payment method, either the security deposit will be used or credits will be deducted." },
    { question: "How is the security deposit determined?", answer: "Security deposits are typically set at 20-30% of the item's market value. This amount is held securely and returned in full once the item is returned in good condition." },
    { question: "How does verification work?", answer: "We verify users through institutional email verification and require a selfie during registration. Additionally, all listings undergo verification by our admin team." },
    { question: "What are the trust levels?", answer: "Our trust system has four levels: Bronze, Silver, Gold, and Platinum. You advance by maintaining positive reviews and completing successful rentals." },
    { question: "How do I report issues?", answer: "You can report issues through the 'Report Issue' button available on any active rental. Our support team will review your report and help resolve the situation." },
  ];

  const openWhatsApp = () => Linking.openURL("https://wa.link/2fcbvl");

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-6 pt-16 pb-12 bg-slate-50">
        <Animated.View entering={FadeIn.duration(1000)}>
          <Text className="text-emerald-600 font-extrabold text-center tracking-[3px] uppercase text-[10px] mb-2">
            Community Guide
          </Text>
          <Text className=" text-4xl font-bold text-slate-900 tracking-tight mb-4 text-center">
            How It Works
          </Text>
          <Text className="text-slate-500 text-base leading-7 text-justify">
            Join the sharing economy. Rent items with cash or credits earned by sharing your own belongings.
          </Text>
        </Animated.View>
      </View>

      {/* Renting Section */}
      <View className="mt-10 px-6">
        <View className="flex-row items-center mb-8">
          <View className="bg-emerald-50 w-10 h-10 rounded-full items-center justify-center mr-3">
            <Ionicons name="cart" size={20} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-slate-900">Renting Items</Text>
        </View>
        {rentingSteps.map((step, index) => (
          <Step key={`rent-${index}`} {...step} index={index} />
        ))}
      </View>

      {/* Safety Banner */}
      <Animated.View entering={FadeInDown.delay(400)} className="mx-6 my-6">
        <LinearGradient
          colors={["#10B981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-[24px] p-6 shadow-lg shadow-emerald-100"
        >
          <View className="flex-row items-center">
            <View className="bg-white/20 p-3 rounded-2xl mr-4">
              <Ionicons name="shield-checkmark" size={28} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">Safety First</Text>
              <Text className="text-emerald-50 text-sm opacity-90  ">
                All rentals are covered by our damage waiver system.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Listing Section */}
      <View className="mt-10 px-6">
        <View className="flex-row items-center mb-8">
          <View className="bg-emerald-50 w-10 h-10 rounded-full items-center justify-center mr-3">
            <Ionicons name="pricetag" size={20} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-slate-900">Listing Items</Text>
        </View>
        {listingSteps.map((step, index) => (
          <Step key={`list-${index}`} {...step} index={index} />
        ))}
      </View>

      {/* Credit System Section - CORRECTED TAGS HERE */}
      <View className="mt-10 bg-slate-50 py-12 px-6">
        <Text className="text-2xl font-bold text-slate-900 mb-2">Credit System</Text>
        <Text className="text-slate-500 text-sm mb-8 leading-5">
          Reward your contributions and access community resources.
        </Text>
        <View className="flex-row justify-between">
          {creditCards.map((card, index) => (
            <CreditCard key={`card-${index}`} {...card} index={index} />
          ))}
        </View>
      </View>

      {/* FAQ Section */}
      <View className="mt-12 px-6">
        <Text className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</Text>
        <View className="bg-slate-50 rounded-[32px] px-6 py-2 border border-slate-100">
          {faqs.map((faq, index) => (
            <FAQItem
              key={`faq-${index}`}
              question={faq.question}
              answer={faq.answer}
              isLast={index === faqs.length - 1}
            />
          ))}
        </View>
      </View>

      {/* Contact Section */}
      <View className="mx-6 mt-12 mb-20">
        <View className="bg-slate-900 rounded-[32px] p-8 items-center shadow-xl shadow-slate-300">
          <Text className="text-white text-2xl font-bold mb-3">Need Help?</Text>
          <Text className="text-slate-400 text-center mb-8 leading-6">
            Our support team is ready to assist you with any questions.
          </Text>
          <TouchableOpacity
            onPress={openWhatsApp}
            className="bg-emerald-500 py-4 px-10 rounded-2xl flex-row items-center"
            activeOpacity={0.9}
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <Text className="text-white font-bold ml-3 text-base">WhatsApp Us</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}