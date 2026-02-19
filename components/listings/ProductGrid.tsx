import React from "react";
import { FlatList } from "react-native";
import { Product } from "../../types/product.types";
import ProductCard from "../cards/ProductCard";

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
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
      contentContainerClassName="p-4"
      showsVerticalScrollIndicator={false}
    />
  );
}
