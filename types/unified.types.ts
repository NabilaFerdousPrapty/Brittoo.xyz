// types/unified.types.ts
import { Product as BrittooProduct } from "./brittoo.types";

// Use Brittoo Product as the main type
export type UnifiedProduct = BrittooProduct;

// Or create a helper to access common fields
export const getProductTitle = (product: UnifiedProduct) => product.name;
export const getProductDescription = (product: UnifiedProduct) =>
  product.productDescription;
export const getProductImage = (product: UnifiedProduct) =>
  product.productImages[0];
export const getProductPrice = (product: UnifiedProduct) => {
  if (product.isForSaleOnly && product.askingPrice) return product.askingPrice;
  if (product.pricePerDay) return product.pricePerDay;
  if (product.pricePerHour) return product.pricePerHour;
  return 0;
};
