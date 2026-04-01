// components/grids/ProductGrid.tsx
import React from "react";
import { FlatList } from "react-native";
import { UnifiedProduct } from "../../types/unified.types";
import ProductCard from "../cards/ProductCard";

interface ProductGridProps {
  products: UnifiedProduct[];
  onProductPress: (product: UnifiedProduct) => void;
}

export default function ProductGrid({
  products,
  onProductPress,
}: ProductGridProps) {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={() => onProductPress(item)} />
      )}
      contentContainerClassName="p-3"
      showsVerticalScrollIndicator={false}
    />
  );
}
