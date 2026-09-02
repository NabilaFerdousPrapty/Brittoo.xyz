import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { STORAGE_KEYS } from "../../constants";
import { adminGetAnalytics } from "../../hooks/api";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconName;
  color: string;
  bg: string;
  onPress?: () => void;
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
  onPress,
}: StatCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      className="flex-1 bg-white border border-gray-100 rounded-2xl p-4"
      style={{
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      }}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: bg }}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>

      <Text className="text-gray-900 text-xl font-bold">
        {value}
      </Text>

      <Text className="text-gray-400 text-xs mt-0.5">
        {label}
      </Text>

      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={12}
          color="#d1d5db"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        />
      )}
    </TouchableOpacity>
  );
}

interface NavItemProps {
  label: string;
  desc: string;
  icon: IconName;
  badge?: number | string;
  onPress: () => void;
}

function NavItem({
  label,
  desc,
  icon,
  badge,
  onPress,
}: NavItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center gap-4 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 mb-2.5"
      style={{
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.02,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      }}
    >
      <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
        <Ionicons name={icon} size={20} color="#374151" />
      </View>

      <View className="flex-1">
        <Text className="text-gray-900 text-sm font-semibold">
          {label}
        </Text>

        <Text className="text-gray-400 text-xs mt-0.5">
          {desc}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {badge !== undefined && (
          <View className="bg-gray-900 rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
            <Text className="text-white text-[10px] font-bold">
              {badge}
            </Text>
          </View>
        )}

        <Ionicons
          name="chevron-forward"
          size={16}
          color="#d1d5db"
        />
      </View>
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    loadData();
    loadAdmin();
  }, []);

  // --------------------------------------------------
  // LOAD ADMIN NAME
  // --------------------------------------------------

  const loadAdmin = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync(
        STORAGE_KEYS.USER
      );

      if (storedUser) {
        const user = JSON.parse(storedUser);

        setAdminName(
          user?.name?.split(" ")[0] ?? "Admin"
        );
      }
    } catch (error) {
      console.error("Failed to load admin:", error);
      setAdminName("Admin");
    }
  };

  // --------------------------------------------------
  // LOAD ANALYTICS
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await adminGetAnalytics();

      /*
       Backend response:

       {
         success: true,
         data: {
           userRegistrations: [],
           productDistribution: [],
           rentalRequestsTimeline: [],
           revenueTimeline: [],
           popularProducts: [],
           rentalDurations: [],
           documentUploadStatus: []
         }
       }
      */

      const analyticsData = res?.data?.data ?? res?.data;

      setAnalytics(analyticsData);
    } catch (error: any) {
      console.error(
        "Analytics error:",
        error?.response?.data || error
      );

      setAnalytics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync(
      STORAGE_KEYS.TOKEN
    );

    await SecureStore.deleteItemAsync(
      STORAGE_KEYS.USER
    );

    router.replace("/(auth)/login");
  };

  // --------------------------------------------------
  // ANALYTICS DATA
  // --------------------------------------------------

  const a = analytics ?? {};

  // Total users
  const totalUsers = (
    a.userRegistrations ?? []
  ).reduce(
    (sum: number, item: any) =>
      sum + Number(item?.users ?? 0),
    0
  );

  // Total products
  const totalProducts = (
    a.productDistribution ?? []
  ).reduce(
    (sum: number, item: any) =>
      sum + Number(item?.count ?? 0),
    0
  );

  // Rental requests
  const totalRentalRequests = (
    a.rentalRequestsTimeline ?? []
  ).reduce(
    (sum: number, item: any) =>
      sum + Number(item?.requests ?? 0),
    0
  );

  // Documents
  const withDocuments =
    (
      a.documentUploadStatus ?? []
    ).find(
      (item: any) =>
        item?.status === "With Documents"
    )?.count ?? 0;

  const withoutDocuments =
    (
      a.documentUploadStatus ?? []
    ).find(
      (item: any) =>
        item?.status === "Without Documents"
    )?.count ?? 0;

  // Registration timeline entries
  const registrationDays = (
    a.userRegistrations ?? []
  ).length;

  // Revenue
  const totalRevenue = (
    a.revenueTimeline ?? []
  ).reduce(
    (sum: number, item: any) =>
      sum +
      Number(
        item?.revenue ??
          item?.amount ??
          0
      ),
    0
  );


  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor="#111827"
          />
        }
      >
        {/* ==========================================
            HEADER
        ========================================== */}

        <View className="bg-white border-b border-gray-100 pt-14 pb-4 px-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-400 text-xs">
                Admin Panel
              </Text>

              <Text className="text-gray-900 text-xl font-semibold">
                Hey, {adminName || "Admin"} 👋
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-2"
            >
              <Ionicons
                name="log-out-outline"
                size={14}
                color="#6b7280"
              />

              <Text className="text-gray-500 text-xs font-medium">
                Sign out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 pt-5">

          {/* ==========================================
              ANALYTICS
          ========================================== */}

          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator
                size="small"
                color="#111827"
              />

              <Text className="text-gray-400 text-xs mt-2">
                Loading analytics...
              </Text>
            </View>
          ) : (
            <>
              {/* PLATFORM OVERVIEW */}

              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                Platform Overview
              </Text>

              {/* ROW 1 */}

              <View className="flex-row gap-3 mb-3">

                <StatCard
                  label="Total Users"
                  value={totalUsers}
                  icon="people-outline"
                  color="#2563eb"
                  bg="#eff6ff"
                  onPress={() =>
                    router.push(
                      "/(admin)/users"
                    )
                  }
                />

                <StatCard
                  label="Products"
                  value={totalProducts}
                  icon="cube-outline"
                  color="#7c3aed"
                  bg="#f5f3ff"
                  onPress={() =>
                    router.push(
                      "/(admin)/products"
                    )
                  }
                />

              </View>

              {/* ROW 2 */}

              <View className="flex-row gap-3 mb-3">

                <StatCard
                  label="Rental Requests"
                  value={totalRentalRequests}
                  icon="swap-horizontal-outline"
                  color="#d97706"
                  bg="#fffbeb"
                  onPress={() =>
                    router.push(
                      "/(admin)/rental-requests"
                    )
                  }
                />

                <StatCard
                  label="With Documents"
                  value={withDocuments}
                  icon="document-text-outline"
                  color="#16a34a"
                  bg="#f0fdf4"
                />

              </View>

              {/* ROW 3 */}

              <View className="flex-row gap-3 mb-5">

                <StatCard
                  label="Without Documents"
                  value={withoutDocuments}
                  icon="document-outline"
                  color="#dc2626"
                  bg="#fef2f2"
                />

                <StatCard
                  label="Registration Groups"
                  value={registrationDays}
                  icon="calendar-outline"
                  color="#0891b2"
                  bg="#ecfeff"
                />

              </View>

              {/* ======================================
                  PRODUCT DISTRIBUTION
              ====================================== */}

              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                Product Distribution
              </Text>

              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-5">

                {(a.productDistribution ?? [])
                  .length === 0 ? (

                  <Text className="text-gray-300 text-sm text-center py-4">
                    No product data
                  </Text>

                ) : (

                  (a.productDistribution ?? []).map(
                    (item: any) => (

                      <View
                        key={item.type}
                        className="flex-row items-center justify-between py-2.5 border-b border-gray-50"
                      >
                        <View className="flex-row items-center gap-2">

                          <View className="w-2 h-2 rounded-full bg-violet-500" />

                          <Text className="text-gray-700 text-sm">
                            {item?.type
                              ?.replace(/_/g, " ")
                              ?.toLowerCase()
                              ?.replace(
                                /\b\w/g,
                                (char: string) =>
                                  char.toUpperCase()
                              )}
                          </Text>

                        </View>

                        <Text className="text-gray-900 font-bold text-sm">
                          {item?.count ?? 0}
                        </Text>
                      </View>
                    )
                  )

                )}

              </View>

              {/* ======================================
                  USER REGISTRATIONS
              ====================================== */}

              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                User Registrations
              </Text>

              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-5">

                {(a.userRegistrations ?? [])
                  .length === 0 ? (

                  <Text className="text-gray-300 text-sm text-center py-4">
                    No registration data
                  </Text>

                ) : (

                  (a.userRegistrations ?? []).map(
                    (item: any) => (

                      <View
                        key={item.date}
                        className="flex-row items-center justify-between py-2.5"
                      >
                        <Text className="text-gray-600 text-sm">
                          {item?.date ?? "—"}
                        </Text>

                        <Text className="text-gray-900 font-bold text-sm">
                          {item?.users ?? 0} users
                        </Text>

                      </View>

                    )
                  )

                )}

              </View>

              {/* ======================================
                  DOCUMENT STATUS
              ====================================== */}

              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                Document Status
              </Text>

              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-5">

                {(a.documentUploadStatus ?? []).map(
                  (item: any) => (

                    <View
                      key={item.status}
                      className="flex-row items-center justify-between py-2.5"
                    >

                      <Text className="text-gray-600 text-sm">
                        {item?.status ?? "Unknown"}
                      </Text>

                      <Text className="text-gray-900 font-bold text-sm">
                        {item?.count ?? 0}
                      </Text>

                    </View>

                  )
                )}

              </View>

              {/* ======================================
                  RENTAL DURATIONS
              ====================================== */}

              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                Rental Durations
              </Text>

              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-5">

                {(a.rentalDurations ?? []).map(
                  (item: any) => (

                    <View
                      key={item.duration}
                      className="flex-row items-center justify-between py-2.5"
                    >

                      <Text className="text-gray-600 text-sm">
                        {item?.duration ?? "Unknown"}
                      </Text>

                      <Text className="text-gray-900 font-bold text-sm">
                        {item?.count ?? 0}
                      </Text>

                    </View>

                  )
                )}

              </View>

              {/* ======================================
                  REVENUE
              ====================================== */}

              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                Revenue
              </Text>

              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-5">

                {(a.revenueTimeline ?? [])
                  .length === 0 ? (

                  <View className="items-center py-4">

                    <Ionicons
                      name="cash-outline"
                      size={28}
                      color="#d1d5db"
                    />

                    <Text className="text-gray-300 text-sm mt-2">
                      No revenue data
                    </Text>

                    <Text className="text-gray-300 text-xs mt-1">
                      No completed rentals yet
                    </Text>

                  </View>

                ) : (

                  <>
                    <View className="flex-row items-center justify-between mb-3">

                      <Text className="text-gray-500 text-sm">
                        Total Revenue
                      </Text>

                      <Text className="text-gray-900 text-lg font-bold">
                        ৳{totalRevenue.toFixed(2)}
                      </Text>

                    </View>

                    {(a.revenueTimeline ?? []).map(
                      (item: any, index: number) => (

                        <View
                          key={
                            item?.date ??
                            `revenue-${index}`
                          }
                          className="flex-row items-center justify-between py-2.5"
                        >

                          <Text className="text-gray-600 text-sm">
                            {item?.date ?? "—"}
                          </Text>

                          <Text className="text-gray-900 font-bold text-sm">
                            ৳
                            {Number(
                              item?.revenue ??
                                item?.amount ??
                                0
                            ).toFixed(2)}
                          </Text>

                        </View>

                      )
                    )}

                  </>

                )}

              </View>

              {/* ======================================
                  POPULAR PRODUCTS
              ====================================== */}

              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                Popular Products
              </Text>

              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-5">

                {(a.popularProducts ?? [])
                  .length === 0 ? (

                  <View className="items-center py-4">

                    <Ionicons
                      name="cube-outline"
                      size={28}
                      color="#d1d5db"
                    />

                    <Text className="text-gray-300 text-sm mt-2">
                      No rental data
                    </Text>

                  </View>

                ) : (

                  (a.popularProducts ?? []).map(
                    (item: any, index: number) => (

                      <View
                        key={
                          item?.id ??
                          item?.productId ??
                          `product-${index}`
                        }
                        className="flex-row items-center justify-between py-2.5"
                      >

                        <Text
                          className="text-gray-700 text-sm flex-1 pr-3"
                          numberOfLines={1}
                        >
                          {item?.name ??
                            item?.product?.name ??
                            "Product"}
                        </Text>

                        <Text className="text-gray-900 font-bold text-sm">
                          {item?.count ??
                            item?.rentals ??
                            0}
                        </Text>

                      </View>

                    )
                  )

                )}

              </View>

              {/* ======================================
                  RENTAL REQUEST TIMELINE
              ====================================== */}

              <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                Rental Request Timeline
              </Text>

              <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-5">

                {(a.rentalRequestsTimeline ?? [])
                  .length === 0 ? (

                  <Text className="text-gray-300 text-sm text-center py-4">
                    No rental requests yet
                  </Text>

                ) : (

                  (a.rentalRequestsTimeline ?? []).map(
                    (item: any, index: number) => (

                      <View
                        key={
                          item?.date ??
                          `request-${index}`
                        }
                        className="flex-row items-center justify-between py-2.5"
                      >

                        <Text className="text-gray-600 text-sm">
                          {item?.date ?? "—"}
                        </Text>

                        <Text className="text-gray-900 font-bold text-sm">
                          {item?.requests ?? 0} requests
                        </Text>

                      </View>

                    )
                  )

                )}

              </View>
            </>
          )}

          {/* ==========================================
              NAVIGATION
          ========================================== */}

          <Text className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
            Manage
          </Text>

          {/* USERS */}

          <NavItem
            label="Users"
            desc="Verify, suspend and inspect users"
            icon="people-outline"
            badge={totalUsers}
            onPress={() =>
              router.push(
                "/(admin)/users"
              )
            }
          />

          {/* RENTAL REQUESTS */}

          <NavItem
            label="Rental Requests"
            desc="Update status, reject, and handle BCC/RCC refunds"
            icon="swap-horizontal-outline"
            onPress={() =>
              router.push(
                "/(admin)/rental-requests"
              )
            }
          />

          {/* PURCHASE REQUESTS */}

          <NavItem
            label="Purchase Requests"
            desc="Approve and manage product sale requests"
            icon="card-outline"
            onPress={() =>
              router.push(
                "/(admin)/purchase-requests"
              )
            }
          />

          {/* PRODUCTS */}

          <NavItem
            label="Products"
            desc="Edit, hold, and admin-update listings"
            icon="cube-outline"
            onPress={() =>
              router.push(
                "/(admin)/products"
              )
            }
          />

          {/* CHAT ROOMS */}

          <NavItem
            label="Chat Rooms"
            desc="Inspect and delete buyer–seller conversations"
            icon="chatbubbles-outline"
            onPress={() =>
              router.push(
                "/(admin)/chatroom"
              )
            }
          />

          {/* ==========================================
              BACK TO MAIN APP
          ========================================== */}

          <TouchableOpacity
            onPress={() =>
              router.replace("/(tabs)/")
            }
            className="flex-row items-center justify-center gap-2 mt-4 py-3"
          >
            <Ionicons
              name="arrow-back-outline"
              size={14}
              color="#9ca3af"
            />

            <Text className="text-gray-400 text-sm">
              Back to main app
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}