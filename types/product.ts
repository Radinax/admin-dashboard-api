// Define allowed product types
export const allowedTypes = [
  "electronics",
  "clothing",
  "furniture",
  "food",
] as const;
export type ProductType = (typeof allowedTypes)[number];
