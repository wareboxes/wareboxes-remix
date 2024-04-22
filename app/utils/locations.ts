import { and, isNull } from "drizzle-orm";
import { db } from "./db";
import { warehouses } from "./types/db/locations";

export const getWarehouses = async (deleted = false) => {
  const res = await db
    .select({ id: warehouses.id, name: warehouses.name, created: warehouses.created, deleted: warehouses.deleted })
    .from(warehouses)
    .where(() => {
      const conditions = [];

      if (!deleted) {
        conditions.push(isNull(warehouses.deleted));
      }

      return and(...conditions);
    });
  return res;
}
