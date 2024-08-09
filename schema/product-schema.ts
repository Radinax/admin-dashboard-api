import { z } from "zod";
import { allowedTypes } from "../types/product";

export const productSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .trim()
    .max(100, { message: "Name must not exceed 100 characters" }),
  type: z.enum(allowedTypes),
  price: z
    .number()
    .positive({ message: "Price must be a positive number" })
    .max(10000, { message: "Price must not exceed 10,000" }),
  description: z.string().optional(),
});

// Type inference for TypeScript
export type Product = z.infer<typeof productSchema>;
