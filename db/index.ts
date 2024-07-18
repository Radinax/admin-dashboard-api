import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate as migrator } from "drizzle-orm/bun-sqlite/migrator";
import { Database } from "bun:sqlite";
import { join } from "node:path";
import * as schema from "./schema";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema, logger: true });

export function migrate() {
  migrator(db, { migrationsFolder: join(import.meta.dirname, "migrations") });
}
