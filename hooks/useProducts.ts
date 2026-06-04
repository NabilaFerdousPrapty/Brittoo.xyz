import { useCallback, useState } from "react";
import { getProducts, GetProductsParams, Product } from "./api";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(
    async (params: GetProductsParams = {}, reset = false) => {
      if (loading) return;
      const currentPage = reset ? 1 : page;
      setLoading(true);
      try {
        const res = await getProducts({
          ...params,
          page: currentPage,
          limit: 20,
        });
        const { products: newProducts, totalPages: tp, total: t } = res.data;
        setProducts(reset ? newProducts : (prev) => [...prev, ...newProducts]);
        setTotalPages(tp);
        setTotal(t);
        if (!reset) setPage((p) => p + 1);
        else setPage(2);
      } catch (err) {
        console.error("fetchProducts error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loading, page],
  );

  const refresh = useCallback(
    (params: GetProductsParams = {}) => {
      setRefreshing(true);
      setPage(1);
      fetchProducts(params, true);
    },
    [fetchProducts],
  );

  const hasMore = page <= totalPages;

  return {
    products,
    loading,
    refreshing,
    hasMore,
    total,
    fetchProducts,
    refresh,
  };
};
