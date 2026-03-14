import BuyCreditsScreen from "@/components/cards/BuyCreditsScreen";
import HowItWorks from "@/components/cards/HowItWorks";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ProductCard from "../../components/cards/ProductCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { categories } from "../../constants/categories";
import { useProductStore } from "../../store/useProductStore";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { products, isLoading, fetchProducts, filterByCategory } =
    useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const featuredProducts = products.slice(0, 6);

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <View className="pt-14 pb-6 px-6 bg-white">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-green-800 text-xs font-bold uppercase  mb-1 text-center">
              Renting is the new owning
            </Text>
            <View className="flex-row items-center">
              <Image
                source={require("../../assets/images/brittoo-logo.png")}
                className="w-16 h-14"
                resizeMode="contain"
              />
              <Text className="text-lg font-bold text-green-600">.</Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-3">
            <TouchableOpacity className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full border border-gray-100">
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#1f2937"
              />
            </TouchableOpacity>
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center overflow-hidden border-2 border-green-50">
              <Text className="text-green-700 font-bold text-xs p-1">Me</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. SOPHISTICATED HERO SECTION */}
      <View className="px-6 mb-8">
        <LinearGradient
          colors={["#ffffff", "#f0fdf4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[32px] p-8 overflow-hidden relative shadow-2xl shadow-gray-400"
        >
          {/* Abstract background detail */}
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/10 rounded-full" />

          <View className="z-10">
            <Text className="text-green-600 text-3xl font-semibold leading-tight">
              Rent. Share. Thrive.
            </Text>
            <Text className="text-gray-400 mt-3 text-sm font-medium leading-5 max-w-[200px]">
              Owning without buying - the smarter way to access gear on demand.
            </Text>

            <TouchableOpacity
              className="bg-green-500 self-start px-6 py-3 rounded-xl mt-6 flex-row items-center"
              onPress={() => router.push("/(tabs)/browse")}
            >
              <Text className="text-white font-bold text-sm mr-2">
                Explore Gear
              </Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Image
            source={require("../../assets/images/brittoo-logo.png")}
            className="absolute right-[-10] bottom-[-10] w-40 h-40 opacity-20"
            resizeMode="contain"
            style={{ tintColor: "#ffffff" }}
          />
        </LinearGradient>
      </View>

      {/* 3. MINIMAL SEARCH (CLEANER) */}
      <View className="px-6 -mt-14 mb-10 z-20">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/browse")}
          className="bg-white rounded-2xl h-16 px-6 flex-row items-center shadow-xl shadow-black/5 border border-gray-100"
        >
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <Text className="text-gray-400 ml-4 font-medium flex-1">
            Search cameras, drones, tools...
          </Text>
          <View className="h-6 w-[1px] bg-gray-200 mr-4" />
          <Ionicons name="options-outline" size={20} color="#059669" />
        </TouchableOpacity>
      </View>

      {/* 4. CURATED CATEGORIES */}
      <View className="mb-10">
        <View className="px-6 flex-row justify-between items-center mb-6">
          <Text className="text-xl font-bold text-gray-900 tracking-tight">
            Categories
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-green-600 font-bold text-sm">View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className="mr-4 items-center"
              onPress={() => {
                filterByCategory(category.name);
                router.push("/(tabs)/browse");
              }}
            >
              <View className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl items-center justify-center mb-2">
                <Text className="text-2xl">{category.icon}</Text>
              </View>
              <Text className="text-xs font-semibold text-gray-700">
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 5. TRENDING SECTION (GRID REFINED) */}
      <View className="px-6 mb-10">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-xl font-bold text-gray-900 tracking-tight">
              Trending Items
            </Text>
            <View className="h-1 w-8 bg-green-500 mt-1 rounded-full" />
          </View>
          <TouchableOpacity>
            <Ionicons
              name="chevron-forward-circle-outline"
              size={28}
              color="#059669"
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {featuredProducts.map((product) => (
            <View
              key={product.id}
              style={{ width: width * 0.43 }}
              className="mb-6"
            >
              <ProductCard
                product={product}
                onPress={() => router.push(`/product/${product.id}`)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* 6. PROFESSIONAL STATS SECTION */}
      <View className="bg-gray-50 py-12 px-6 border-2 border-green-500 rounded-2xl mx-2 mb-10 relative overflow-hidden">
        <Text className="text-green-500 font-bold uppercase tracking-[3px] text-[10px] mb-2 text-center">
          Why Brittoo
        </Text>
        <Text className="text-green-600 text-2xl font-bold text-center mb-10">
          The New Standard of Sharing
        </Text>

        <View className="flex-row flex-wrap justify-between">
          {[
            {
              icon: "shield-checkmark-outline",
              title: "Protected",
              desc: "Insurance included",
            },
            {
              icon: "wallet-outline",
              title: "Cost Effective",
              desc: "Save up to 70%",
            },
            {
              icon: "leaf-outline",
              title: "Eco-Conscious",
              desc: "Reduce footprint",
            },
            {
              icon: "flash-outline",
              title: "Instant Access",
              desc: "Nearby pick-up",
            },
          ].map((item, index) => (
            <View
              key={index}
              className="w-[48%] bg-white/5 border border-green-500 p-5 rounded-2xl mb-4 touchable-opacity"
            >
              <Ionicons name={item.icon as any} size={24} color="#10b981" />
              <Text className="font-bold text-gray-800 mt-3 text-sm">
                {item.title}
              </Text>
              <Text className="text-[11px] text-gray-800 mt-1 leading-4">
                {item.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="py-8 bg-white">
        <HowItWorks />
        <BuyCreditsScreen />
      </View>
    </ScrollView>
  );
}
