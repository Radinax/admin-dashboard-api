import type { Order } from "../schema";

export type Bus = {
  orderAdded: [order: Order];
};
