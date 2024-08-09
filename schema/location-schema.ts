import { z } from "zod";

export const locationSchema = z.object({
  id: z.number().optional(), // ID is optional for inserts
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  coordinates: z.string().optional(), // Coordinates can be a string (e.g., "lat,long") or omitted
});

// Type inference for TypeScript
export type Location = z.infer<typeof locationSchema>;
