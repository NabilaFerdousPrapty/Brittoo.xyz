import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Modal, Text, View } from "react-native";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  text?: string;
  overlay?: boolean;
  size?: "small" | "large";
  variant?: "default" | "gradient" | "dots" | "pulse";
}

export default function LoadingSpinner({
  fullScreen = false,
  text,
  overlay = false,
  size = "large",
  variant = "default",
}: LoadingSpinnerProps) {
  // Dots loading component
  const DotsLoading = () => (
    <View className="flex-row items-center justify-center space-x-2">
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          className="w-3 h-3 bg-green-500 rounded-full"
          style={{
            opacity: 1,
          }}
        />
      ))}
    </View>
  );

  // Pulse loading component
  const PulseLoading = () => (
    <View className="items-center justify-center">
      <View className="w-12 h-12 rounded-full bg-green-500/20" />
      <View className="absolute w-12 h-12 rounded-full bg-green-500/40" />
      <View className="absolute w-8 h-8 rounded-full bg-green-500 items-center justify-center">
        <ActivityIndicator size="small" color="white" />
      </View>
    </View>
  );

  // Gradient loading component
  const GradientLoading = () => (
    <LinearGradient
      colors={["#22c55e", "#15803d", "#22c55e"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-2xl p-6 items-center shadow-lg"
      style={{ elevation: 5 }}
    >
      <ActivityIndicator
        size={size === "large" ? "large" : "small"}
        color="white"
      />
      {text && (
        <Text className="text-white font-semibold mt-3 text-center">
          {text}
        </Text>
      )}
    </LinearGradient>
  );

  // Default loading component
  const DefaultLoading = () => (
    <View className="items-center justify-center">
      <View className="relative">
        {/* Outer ring */}
        <View className="w-16 h-16 rounded-full border-4 border-green-100" />
        {/* Inner spinner */}
        <ActivityIndicator
          size={size}
          color="#22c55e"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </View>
      {text && (
        <Text className="text-gray-600 mt-4 text-base font-medium">{text}</Text>
      )}
    </View>
  );

  // Full screen loading with backdrop
  if (fullScreen || overlay) {
    return (
      <Modal transparent={true} visible={true} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 min-w-[200px] items-center shadow-xl">
            {variant === "gradient" ? (
              <GradientLoading />
            ) : variant === "pulse" ? (
              <PulseLoading />
            ) : variant === "dots" ? (
              <>
                <DotsLoading />
                {text && (
                  <Text className="text-gray-600 mt-3 text-sm">{text}</Text>
                )}
              </>
            ) : (
              <DefaultLoading />
            )}
          </View>
        </View>
      </Modal>
    );
  }

  // Inline loading variants
  if (variant === "dots") {
    return (
      <View className="py-4 justify-center items-center">
        <DotsLoading />
        {text && <Text className="text-gray-500 text-sm mt-2">{text}</Text>}
      </View>
    );
  }

  if (variant === "pulse") {
    return (
      <View className="py-4 justify-center items-center">
        <PulseLoading />
        {text && <Text className="text-gray-500 text-sm mt-2">{text}</Text>}
      </View>
    );
  }

  if (variant === "gradient") {
    return (
      <View className="py-4 justify-center items-center">
        <GradientLoading />
      </View>
    );
  }

  // Default inline loading
  return (
    <View className="py-4 justify-center items-center">
      <View className="relative">
        <View className="w-8 h-8 rounded-full border-2 border-green-100" />
        <ActivityIndicator
          size={size === "large" ? "large" : "small"}
          color="#22c55e"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </View>
      {text && <Text className="text-gray-500 text-sm mt-2">{text}</Text>}
    </View>
  );
}

// Additional specialized loading components
export const SkeletonLoader = () => (
  <View className="bg-gray-200 rounded-lg">
    <View className="w-full h-full" />
  </View>
);

export const CardSkeleton = () => (
  <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
    <View className="flex-row items-center mb-3">
      <View className="w-12 h-12 bg-gray-200 rounded-full" />
      <View className="ml-3 flex-1">
        <View className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <View className="h-3 bg-gray-200 rounded w-1/2" />
      </View>
    </View>
    <View className="h-20 bg-gray-200 rounded" />
  </View>
);

export const ProductCardSkeleton = () => (
  <View className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
    <View className="w-full h-48 bg-gray-200" />
    <View className="p-3">
      <View className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <View className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <View className="h-4 bg-gray-200 rounded w-1/3" />
    </View>
  </View>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <View className="p-4">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </View>
);
