import { z } from "zod";
import { allowedTypes } from "../types/product";

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

export const productSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .trim()
    .max(100, { message: "Name must not exceed 100 characters" }),
  type: z.enum(allowedTypes, {
    errorMap: () => ({ message: "Please select a valid type" }),
  }),
  price: z
    .number()
    .positive({ message: "Price must be a positive number" })
    .max(10000, { message: "Price must not exceed 10,000" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.enum(allowedCategories, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  stock: z.number().int().nonnegative({ message: "Stock must be zero or positive" }),
});

// Type inference for TypeScript
export type Product = z.infer<typeof productSchema>;
