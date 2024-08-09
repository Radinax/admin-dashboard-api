import { z } from "zod";

export enum OrderStatus {
  InProcess = "in_process",
  Completed = "completed",
}

export const orderSchema = z.object({
  id: z.string(),
  date: z.coerce.date(),
  stock: z.string(),
  type: z.string(),
  status: z.nativeEnum(OrderStatus),
  quantity: z.number(),
  price: z.number(),
});

export const createOrderSchema = orderSchema.pick({
  stock: true,
  quantity: true,
  price: true,
});

// Type inference for TypeScript
export type Order = z.infer<typeof orderSchema>;
