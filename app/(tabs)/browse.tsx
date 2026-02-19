import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import AuthModal from "../../components/common/AuthModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import FilterBar from "../../components/listings/FilterBar";
import ProductGrid from "../../components/listings/ProductGrid";
import { useAuthStore } from "../../store/useAuthStore";
import { useProductStore } from "../../store/useProductStore";

export default function BrowseScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    filteredProducts,
    isLoading,
    searchQuery,
    selectedCategory,
    searchProducts,
    filterByCategory,
    fetchProducts,
  } = useProductStore();

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductPress = (product: any) => {
    if (isAuthenticated) {
      router.push(`/product/${product.id}`);
    } else {
      setSelectedProduct(product);
      setShowAuthModal(true);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={searchProducts}
        selectedCategory={selectedCategory}
        onCategorySelect={filterByCategory}
      />

      <ProductGrid
        products={filteredProducts}
        onProductPress={handleProductPress}
      />

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please login to view product details and make bookings"
      />
    </View>
  );
}
