// store/productStore.ts
import { create } from "zustand";
import { mockProducts } from "../constants/newMockdata";
import { Product } from "../types/brittoo.types";

interface ProductStore {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string | null;

  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  searchProducts: (query: string) => void;
  filterByCategory: (category: string | null) => void;
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  filteredProducts: [],
  selectedProduct: null,
  isLoading: false,
  searchQuery: "",
  selectedCategory: null,

  setProducts: (products) => set({ products, filteredProducts: products }),

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  searchProducts: (query) => {
    const { products, selectedCategory } = get();
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        (product.productDescription?.toLowerCase() || "").includes(
          query.toLowerCase(),
        );
      const matchesCategory = selectedCategory
        ? product.productType === selectedCategory
        : true;
      return matchesSearch && matchesCategory;
    });
    set({ searchQuery: query, filteredProducts: filtered });
  },

  filterByCategory: (category) => {
    const { products, searchQuery } = get();
    const filtered = products.filter((product) => {
      const matchesSearch = searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.productDescription?.toLowerCase() || "").includes(
            searchQuery.toLowerCase(),
          )
        : true;
      const matchesCategory = category
        ? product.productType === category
        : true;
      return matchesSearch && matchesCategory;
    });
    set({ selectedCategory: category, filteredProducts: filtered });
  },

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter out deleted products and only show available ones
      const availableProducts = mockProducts.filter(
        (product) => !product.deletedAt && product.isAvailable,
      );

      set({
        products: availableProducts,
        filteredProducts: availableProducts,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      set({ isLoading: false });
    }
  },
}));
