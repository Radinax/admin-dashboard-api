import cuid from "cuid";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { InferSelectModel } from "drizzle-orm";
import { float } from "../utils/sqlite-float";

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
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
