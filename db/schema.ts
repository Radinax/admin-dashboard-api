import cuid from "cuid";
import {
  customType,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { type InferSelectModel } from "drizzle-orm";
import { float } from "../utils/sqlite-float";
import type { ProductType } from "../types/product";

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
  type: text("type").$type<ProductType>().notNull(),
  price: float("price").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  stock: integer("stock").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type DatabaseUserType = InferSelectModel<typeof users>;
export type DatabaseProductType = InferSelectModel<typeof products>;
