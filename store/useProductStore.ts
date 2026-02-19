import { create } from "zustand";
import { mockProducts } from "../constants/mockData";
import { Product } from "../types/product.types";

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
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategory
        ? product.category === selectedCategory
        : true;
      return matchesSearch && matchesCategory;
    });
    set({ searchQuery: query, filteredProducts: filtered });
  },

  filterByCategory: (category) => {
    const { products, searchQuery } = get();
    const filtered = products.filter((product) => {
      const matchesSearch = searchQuery
        ? product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesCategory = category ? product.category === category : true;
      return matchesSearch && matchesCategory;
    });
    set({ selectedCategory: category, filteredProducts: filtered });
  },

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({
        products: mockProducts,
        filteredProducts: mockProducts,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      set({ isLoading: false });
    }
  },
}));
