import { customType } from "drizzle-orm/sqlite-core";

export const float = customType<{ data: number; driverData: string }>({
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
