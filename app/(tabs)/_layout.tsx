
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  View,
} from "react-native";

const GREEN = "#16A34A";
const DARK_GREEN = "#166534";
const LIGHT_GREEN = "#DCFCE7";
const VERY_LIGHT_GREEN = "#F0FDF4";
const INACTIVE_GREEN = "#7A9481";

function AnimatedTabIcon({
  focused,
  icon,
  activeIcon,
  size = 23,
}: {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  size?: number;
}) {
  const scale = useRef(
    new Animated.Value(focused ? 1 : 0.9)
  ).current;

  const opacity = useRef(
    new Animated.Value(focused ? 1 : 0.75)
  ).current;

  const indicatorScale = useRef(
    new Animated.Value(focused ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.08 : 0.94,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),

      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.72,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.spring(indicatorScale, {
        toValue: focused ? 1 : 0,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <View
      style={{
        width: 48,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Active green pill */}
      <Animated.View
        style={{
          position: "absolute",
          top: 1,
          width: 34,
          height: 30,
          borderRadius: 15,
          backgroundColor: VERY_LIGHT_GREEN,
          opacity: indicatorScale,
          transform: [
            {
              scale: indicatorScale,
            },
          ],
        }}
      />

      {/* Icon */}
      <Animated.View
        style={{
          opacity,
          transform: [{ scale }],
        }}
      >
        <Ionicons
          name={
            focused && activeIcon
              ? activeIcon
              : icon
          }
          size={size}
          color={
            focused
              ? GREEN
              : INACTIVE_GREEN
          }
        />
      </Animated.View>

      {/* Small active dot */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: GREEN,
          opacity: indicatorScale,
          transform: [
            {
              scale: indicatorScale,
            },
          ],
        }}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // -----------------------------------------------
        // Colors
        // -----------------------------------------------

        tabBarActiveTintColor: GREEN,
        tabBarInactiveTintColor: INACTIVE_GREEN,

        // -----------------------------------------------
        // Tab Bar
        // -----------------------------------------------

        tabBarStyle: {
          height: 66,

          paddingTop: 7,
          paddingBottom: 9,

          backgroundColor: "#FFFFFF",

          borderTopWidth: 1,
          borderTopColor: "#E1EEE5",

          elevation: 8,

          shadowColor: "#166534",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },

        // -----------------------------------------------
        // Labels
        // -----------------------------------------------

        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: "600",
          marginTop: 1,
        },

        tabBarItemStyle: {
          paddingVertical: 0,
        },
      }}
    >
      {/* ================================================= */}
      {/* HOME */}
      {/* ================================================= */}

      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",

          tabBarIcon: ({
            focused,
            size,
          }) => (
            <AnimatedTabIcon
              focused={focused}
              icon="home-outline"
              activeIcon="home"
              size={size}
            />
          ),
        }}
      />

      {/* ================================================= */}
      {/* BROWSE */}
      {/* ================================================= */}

      <Tabs.Screen
        name="listing"
        options={{
          title: "Browse",

          tabBarIcon: ({
            focused,
            size,
          }) => (
            <AnimatedTabIcon
              focused={focused}
              icon="search-outline"
              activeIcon="search"
              size={size}
            />
          ),
        }}
      />

      {/* ================================================= */}
      {/* ADD */}
      {/* ================================================= */}

      <Tabs.Screen
        name="create"
        options={{
          title: "Add",

          tabBarIcon: ({
            focused,
            size,
          }) => (
            <AnimatedTabIcon
              focused={focused}
              icon="add-circle-outline"
              activeIcon="add-circle"
              size={size + 1}
            />
          ),
        }}
      />

      {/* ================================================= */}
      {/* INBOX */}
      {/* ================================================= */}

      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",

          tabBarIcon: ({
            focused,
            size,
          }) => (
            <AnimatedTabIcon
              focused={focused}
              icon="chatbubbles-outline"
              activeIcon="chatbubbles"
              size={size}
            />
          ),
        }}
      />

      {/* ================================================= */}
      {/* PROFILE */}
      {/* ================================================= */}

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({
            focused,
            size,
          }) => (
            <AnimatedTabIcon
              focused={focused}
              icon="person-outline"
              activeIcon="person"
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}

