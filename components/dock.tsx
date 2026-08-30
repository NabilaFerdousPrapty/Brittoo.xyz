// components/dock.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home", route: "/(app)/dashboard" },
  { key: "browse", label: "Browse", icon: "search-outline", activeIcon: "search", route: "/(app)/(products)" },
  { key: "add", label: "Add", icon: "add", route: "/(app)/create" }, 
  { key: "inbox", label: "Inbox", icon: "mail-outline", activeIcon: "mail", route: "/(app)/inbox" },
  { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person", route: "/(app)/profile" },
] as const;

export function Dock() {
  const pathname = usePathname();

  return (
    <SafeAreaView edges={["bottom"]} className="bg-white border-t border-gray-100">
      <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
        {TABS.map((tab) => {
          const isActive = pathname === tab.route;
          const isAdd = tab.key === "add";

          if (isAdd) {
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => router.push(tab.route as any)}
                className="items-center justify-center -mt-6"
              >
                <View
                  className="w-14 h-14 rounded-full bg-emerald-600 items-center justify-center"
                  style={{
                    elevation: 6,
                    shadowColor: "#059669",
                    shadowOpacity: 0.35,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                  }}
                >
                  <Ionicons name="add" size={26} color="#fff" />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => router.push(tab.route as any)}
              className="items-center justify-center flex-1 py-1"
            >
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={isActive ? "#059669" : "#9ca3af"}
              />
              <Text
                className="text-[10px] mt-0.5"
                style={{ color: isActive ? "#059669" : "#9ca3af" }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}