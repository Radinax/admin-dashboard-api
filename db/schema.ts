import cuid from "cuid";
import {
  customType,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type { InferSelectModel } from "drizzle-orm";

const float = customType<{ data: number; driverData: string }>({
  dataType() {
    return "decimal";
  },
  fromDriver(value) {
    return parseFloat(value);
  },
  toDriver(value) {
    return String(value);
  },
});

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = sqliteTable("product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  name: text("name").notNull(),
  type: text("type").notNull(),
  price: float("price"),
  description: text("description"),
});

export enum OrderStatus {
  InProcess = "in_process",
  Completed = "completed",
}

export const orders = sqliteTable("order", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  date: integer("date", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  stock: text("stock").notNull(),
  status: text("status")
    .$type<OrderStatus>()
    .notNull()
    .default(OrderStatus.InProcess),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull(),
  price: float("price").notNull(),
});

export type Order = InferSelectModel<typeof orders>;
