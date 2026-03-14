import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

type IconName = keyof typeof Ionicons.glyphMap;

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: IconName;
  color: string;
}

const Step = ({ number, title, description, icon, color }: StepProps) => (
  <View className="flex-row mb-6">
    <View className="mr-4 items-center">
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View className="flex-1 w-0.5 bg-gray-200 my-2" />
      <View className="w-6 h-6 rounded-full bg-gray-100 items-center justify-center">
        <Text className="text-xs font-bold text-gray-500">{number}</Text>
      </View>
    </View>
    <View className="flex-1">
      <Text className="text-lg font-semibold text-gray-900 mb-1">{title}</Text>
      <Text className="text-gray-600 leading-5">{description}</Text>
    </View>
  </View>
);

interface FAQItemProps {
  question: string;
  answer: string;
  isLast?: boolean;
}

const FAQItem = ({ question, answer, isLast }: FAQItemProps) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View className={`border-b border-gray-100 ${isLast ? "border-b-0" : ""}`}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        className="py-4 flex-row justify-between items-center"
        activeOpacity={0.7}
      >
        <Text className="flex-1 text-gray-900 font-medium pr-4">
          {question}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>
      {expanded && (
        <View className="pb-4">
          <Text className="text-gray-600 leading-5">{answer}</Text>
        </View>
      )}
    </View>
  );
};

interface CreditCardProps {
  icon: IconName;
  title: string;
  description: string;
  color: string;
}

const CreditCard = ({ icon, title, description, color }: CreditCardProps) => (
  <View className="bg-white rounded-xl p-4 flex-1 mx-1 shadow-sm">
    <View
      className="w-10 h-10 rounded-lg items-center justify-center mb-3"
      style={{ backgroundColor: `${color}15` }}
    >
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text className="font-semibold text-gray-900 mb-1">{title}</Text>
    <Text className="text-xs text-gray-600 leading-4">{description}</Text>
  </View>
);

export default function HowItWorks() {
  const rentingSteps: StepProps[] = [
    {
      number: 1,
      title: "Browse Listings",
      description:
        "Explore our categorized and verified listings to find exactly what you need.",
      icon: "search-outline",
      color: "#3B82F6",
    },
    {
      number: 2,
      title: "Choose Payment Method",
      description:
        "Decide whether to pay with cash deposit or use your earned credits.",
      icon: "card-outline",
      color: "#8B5CF6",
    },
    {
      number: 3,
      title: "Arrange Pickup",
      description:
        "Coordinate with the owner for a convenient pickup location and time.",
      icon: "location-outline",
      color: "#EC4899",
    },
    {
      number: 4,
      title: "Return & Review",
      description:
        "Return the item in good condition and leave a review about your experience.",
      icon: "star-outline",
      color: "#F59E0B",
    },
  ];

  const listingSteps: StepProps[] = [
    {
      number: 1,
      title: "Create a Listing",
      description:
        "Add details, photos, and set your rental price or credit requirements.",
      icon: "create-outline",
      color: "#10B981",
    },
    {
      number: 2,
      title: "Get Verified",
      description:
        "Our team reviews your listing to ensure quality and accuracy.",
      icon: "shield-checkmark-outline",
      color: "#6366F1",
    },
    {
      number: 3,
      title: "Respond to Requests",
      description: "Accept rental requests and arrange item handover details.",
      icon: "chatbubbles-outline",
      color: "#F43F5E",
    },
    {
      number: 4,
      title: "Earn & Grow",
      description:
        "Collect cash or earn credits while building your trust profile.",
      icon: "trending-up-outline",
      color: "#14B8A6",
    },
  ];

  const creditCards: CreditCardProps[] = [
    {
      icon: "wallet-outline",
      title: "Earn Credits",
      description:
        "List your items and earn credits when others rent them based on item value.",
      color: "#10B981",
    },
    {
      icon: "cart-outline",
      title: "Spend Credits",
      description:
        "Use earned credits to rent items without paying cash deposits.",
      color: "#8B5CF6",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Gain Trust",
      description:
        "Build trust through successful rentals and earn badges that increase your opportunities.",
      color: "#F59E0B",
    },
  ];

  const faqs: FAQItemProps[] = [
    {
      question: "How does the credit system work?",
      answer:
        "Our credit system allows you to earn credits by renting out your items. These credits can then be used to rent items from other users without paying cash. Credits are non-convertible to cash and are designed to encourage sharing within our community.",
    },
    {
      question: "What happens if an item is damaged?",
      answer:
        "We have a damage waiver system in place. If an item is damaged during rental, the borrower is responsible. Depending on the selected payment method, either the security deposit will be used or credits will be deducted. Our admin team reviews all damage claims for fair resolution.",
    },
    {
      question: "How is the security deposit determined?",
      answer:
        "Security deposits are typically set at 20-30% of the item's market value. This amount is held securely and returned in full once the item is returned in the same condition as it was rented.",
    },
    {
      question: "How does verification work?",
      answer:
        "We verify users through institutional email verification (for university students) and require a selfie during registration. Additionally, all listings undergo verification by our admin team to ensure quality and accuracy.",
    },
    {
      question: "What are the trust levels and how do I advance?",
      answer:
        "Our trust system has four levels: Bronze, Silver, Gold, and Platinum. You advance by maintaining positive reviews, completing successful rentals, and following community guidelines. Higher trust levels unlock benefits like reduced security deposits and priority listing visibility.",
    },
    {
      question: "How do I report issues with a rental?",
      answer:
        "You can report issues through the 'Report Issue' button available on any active rental. Our support team will review your report and help resolve the situation according to our dispute resolution policy.",
    },
  ];

  const openWhatsApp = () => {
    Linking.openURL("https://wa.link/2fcbvl");
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <LinearGradient
        colors={["#059669", "#10B981"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-12 pb-16 rounded-b-3xl  mx-2 rounded-xl shadow-lg shadow-green-200"
      >
        <Text className="text-3xl font-bold text-white mb-3">How It Works</Text>
        <Text className="text-green-100 text-base leading-6">
          Our platform makes it easy to rent items with cash or credits earned
          by renting your own items. Join our community to reduce waste and get
          access to more while owning less.
        </Text>
      </LinearGradient>

      {/* Renting Section */}
      <View className="mt-8 px-6">
        <View className="flex-row items-center mb-6">
          <View className="bg-blue-50 p-3 rounded-xl mr-3">
            <Ionicons name="cart-outline" size={24} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Renting Items
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-sm">
          {rentingSteps.map((step, index) => (
            <Step key={index} {...step} />
          ))}
        </View>
      </View>

      {/* Safety Banner */}
      <View className="mx-6 mt-6">
        <LinearGradient
          colors={["#F59E0B", "#FBBF24"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-2xl p-5"
        >
          <View className="flex-row items-start">
            <View className="bg-white/20 p-2 rounded-lg mr-3">
              <Ionicons name="shield" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base mb-1">
                Safety First
              </Text>
              <Text className="text-white/90 text-sm leading-5">
                All rentals are covered by our damage waiver system to protect
                both parties.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Listing Section */}
      <View className="mt-8 px-6">
        <View className="flex-row items-center mb-6">
          <View className="bg-green-50 p-3 rounded-xl mr-3">
            <Ionicons name="pricetag-outline" size={24} color="#10B981" />
          </View>
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Listing Your Items
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-sm">
          {listingSteps.map((step, index) => (
            <Step key={index} {...step} />
          ))}
        </View>
      </View>

      {/* Trust Banner */}
      <View className="mx-6 mt-6">
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-2xl p-5"
        >
          <View className="flex-row items-start">
            <View className="bg-white/20 p-2 rounded-lg mr-3">
              <Ionicons name="ribbon" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base mb-1">
                Build Trust
              </Text>
              <Text className="text-white/90 text-sm leading-5">
                Higher trust levels unlock better opportunities and features on
                the platform.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Credit System Section */}
      <View className="mt-8 px-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Credit System Explained
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Our credit system enables a true sharing economy where your
            contributions are rewarded and can be used to access other community
            resources.
          </Text>
        </View>

        <View className="flex-row justify-between">
          {creditCards.map((card, index) => (
            <CreditCard key={index} {...card} />
          ))}
        </View>
      </View>

      {/* FAQ Section */}
      <View className="mt-8 px-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Find answers to common questions about using Brittoo's rental
            platform
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-sm">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isLast={index === faqs.length - 1}
            />
          ))}
        </View>
      </View>

      {/* Support Section */}
      <View className="mx-6 mt-8 mb-8">
        <View className="bg-white rounded-2xl p-6 shadow-sm items-center">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Still have questions?
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            We're here to help! Our support team is ready to assist you with any
            questions or concerns.
          </Text>
          <TouchableOpacity
            onPress={openWhatsApp}
            className="bg-green-600 py-3 px-6 rounded-xl flex-row items-center"
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <Text
              className="text-white font-semibold ml-2"
              onPress={openWhatsApp}
            >
              contact us on WhatsApp
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
