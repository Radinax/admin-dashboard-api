import cuid from "cuid";
import {
  customType,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { relations, type InferSelectModel } from "drizzle-orm";
import { float } from "../utils/sqlite-float";
import type { ProductType } from "../types/product";
import { OrderStatus } from "../schema";

export type Point = {
  lat: number;
  lng: number;
};

export type Permission = "admin" | "user";

const point = customType<{ data: Point; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(value) {
    return [value.lng, value.lat].join(",");
  },
  fromDriver(value) {
    const [lng, lat] = value.split(",").map(Number);
    return { lat, lng };
  },
});

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  permission: text("permission")
    .$type<Permission>()
    .$defaultFn(() => "user"),
  location: point("location"),
});

export const products = sqliteTable("product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  name: text("name").notNull(),
  type: text("type").$type<ProductType>(),
  price: float("price"),
  description: text("description"),
});

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

export const warehouses = sqliteTable("warehouse", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  name: text("name"),
  location: point("location"),
});

/**
 * USER - WAREHOUSE RELATION
 */
export const usersWarehouses = sqliteTable(
  "user_warehouse",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),

    warehouseId: text("warehouse_id")
      .notNull()
      .references(() => warehouses.id),

    permission: text("permission").$type<Permission>().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.warehouseId] }),
  })
);

export const usersWarehousesRelations = relations(
  usersWarehouses,
  ({ one }) => ({
    user: one(users, {
      fields: [usersWarehouses.userId],
      references: [users.id],
    }),
    warehouse: one(warehouses, {
      fields: [usersWarehouses.warehouseId],
      references: [warehouses.id],
    }),
  })
);

/**
 * PRODUCT - WAREHOUSE RELATION
 */
export const productsWarehouses = sqliteTable(
  "product_warehouse",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    warehouseId: text("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.warehouseId] }),
  })
);
export const productsWarehousesRelations = relations(
  productsWarehouses,
  ({ one }) => ({
    user: one(products, {
      fields: [productsWarehouses.productId],
      references: [products.id],
    }),
    warehouse: one(warehouses, {
      fields: [productsWarehouses.warehouseId],
      references: [warehouses.id],
    }),
  })
);

export type DatabaseUserType = InferSelectModel<typeof users>;
export type DatabaseProductType = InferSelectModel<typeof products>;
export type DatabaseWarehouseType = InferSelectModel<typeof warehouses>;
// export type DatabaseOrderType = InferSelectModel<typeof orders>;
