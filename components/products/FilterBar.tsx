import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";

const PRODUCT_TYPES = [
  { label: "All", value: "" },
  { label: "Gadget", value: "GADGET" },
  { label: "Electronics", value: "ELECTRONICS" },
  { label: "Vehicle", value: "VEHICLE" },
  { label: "Furniture", value: "FURNITURE" },
  { label: "Clothing", value: "CLOTHING" },
  { label: "Book", value: "BOOK" },
  { label: "Academic", value: "ACADEMIC_BOOK" },
  { label: "Stationary", value: "STATIONARY" },
  { label: "Music", value: "MUSICAL_INSTRUMENT" },
  { label: "Apartment", value: "APARTMENTS" },
  { label: "Others", value: "OTHERS" },
];

interface Props {
  selected: string;
  onSelect: (value: string) => void;
}

export const FilterBar: React.FC<Props> = ({ selected, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 6 }}
  >
    {PRODUCT_TYPES.map((t) => {
      const active = selected === t.value;
      return (
        <TouchableOpacity
          key={t.value}
          onPress={() => onSelect(t.value)}
          className={`px-4 py-2 rounded-full border ${
            active
              ? "bg-gray-900 border-gray-900"
              : "bg-white border-gray-200"
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`text-xs font-medium ${active ? "text-white" : "text-gray-600"}`}
          >
            {t.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);
