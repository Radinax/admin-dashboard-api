// Define allowed product types
export const allowedTypes = [
  "electronics",
  "clothing",
  "furniture",
  "food",
] as const;
export type ProductType = (typeof allowedTypes)[number];

// Define allowed product categories
export const allowedCategories = [
  "smartphones",
  "laptops",
  "accessories",
  "shirts",
  "pants",
  "shoes",
  "tables",
  "chairs",
  "sofas",
  "snacks",
  "beverages",
  "meals",
] as const;
export type ProductCategory = (typeof allowedCategories)[number];
