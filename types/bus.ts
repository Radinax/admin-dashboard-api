import type { Order } from "../db/schema";

export type Bus = {
  orderAdded: [order: Order];
};
