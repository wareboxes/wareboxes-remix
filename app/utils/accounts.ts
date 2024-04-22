import { and, eq, isNull, notInArray, sql } from "drizzle-orm";
import { db } from "./db";
import { InsertAccount, accountWarehouses, accounts } from "./types/db/accounts";
import { orders } from "./types/db/orders";
import { z } from "zod";
import { SelectWarehouse as Warehouse, warehouses } from "./types/db/locations";

export const addAccount = async (accountName: string, email: string) => {
  const res = await db
    .insert(accounts)
    .values({ name: accountName, email })
    .onConflictDoNothing()
    .returning({ id: accounts.id });
  return res[0].id;
}

export const updateAccount = async (accountId: number, accountData: Partial<InsertAccount>) => {
  const res = await db
    .update(accounts)
    .set(accountData)
    .where(eq(accounts.id, accountId));
  return !!res;
}

export const deleteAccount = async (accountId: number) => {
  // If the account has any orders not shipped or cancelled, return false
  const orderStatuses = await db
    .select()
    .from(orders)
    .where(and(eq(orders.accountId, accountId), notInArray(orders.status, ["shipped", "cancelled"])));

  // TODO: RETURN WITH ERROR MESSAGE
  if (orderStatuses.length) {
    return false;
  }
  const res = await db
    .update(accounts)
    .set({ deleted: new Date().toISOString() })
    .where(eq(accounts.id, accountId));
  return !!res;
}

export const restoreAccount = async (accountId: number) => {
  const res = await db
    .update(accounts)
    .set({ deleted: null })
    .where(eq(accounts.id, accountId));
  return !!res;
}

export const getAccount = async (accountId: number) => {
  const res = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId));
  return res[0];
}

export const getAccounts = async (showDeleted = false) => {
  const res = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      email: accounts.email,
      created: accounts.created,
      deleted: accounts.deleted,
      accountWarehouses: sql<Warehouse[]>`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ${warehouses.id},
              'name', ${warehouses.name},
              'created', ${warehouses.created},
              'deleted', ${warehouses.deleted}
            )
          ) FILTER (WHERE ${warehouses.deleted} IS NULL),
          '[]'
        )
      `
    })
    .from(accounts)
    .leftJoin(accountWarehouses,
      and(eq(accountWarehouses.accountId, accounts.id), isNull(accountWarehouses.deleted)))
    .leftJoin(warehouses, eq(warehouses.id, accountWarehouses.warehouseId))
    .where(() => {
      const conditions = [];

      if (!showDeleted) {
        conditions.push(isNull(accounts.deleted));
      }

      return and(...conditions);
    })
    .groupBy(accounts.id);
  return res;
}

export const AccountUpdateSchema = z.object({
  accountId: z.number({ coerce: true }).positive("Invalid account ID"),
  name: z.string().min(3, "Account name is required").optional(),
  email: z.string().email("Invalid email").optional(),
});

export const AccountDeleteRestoreSchema = z.object({
  accountId: z.number({ coerce: true }).positive("Invalid account ID"),
});