import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgEnum,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";
import { InsertAddress, SelectAddress, addresses, wareboxes } from "./base";
import { itemBatches } from "./inventory";
import { items } from "./items";

export const orderStatus = pgEnum("order_status", [
  "awaiting shipment",
  "shipped",
  "cancelled",
  "held",
  "processing",
  "open",
]);

export const pickWaves = wareboxes.table("pick_waves", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  name: varchar("name"),
});

export const orders = wareboxes.table(
  "orders",
  {
    id: serial("id").primaryKey().notNull(),
    orderKey: varchar("order_key", { length: 255 }).notNull(),
    created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
    deleted: timestamp("deleted", { mode: "string" }),
    rush: boolean("rush").default(false).notNull(),
    status: orderStatus("status").notNull().default("open"),
    addressId: integer("address_id").notNull(),
    confirmed: timestamp("confirmed", { mode: "string" }),
    closed: timestamp("closed", { mode: "string" }),
    shipBy: date("ship_by"),
    waveId: integer("wave_id").references(() => pickWaves.id),
    accountId: integer("account_id").references(() => accounts.id),
  },
  (table) => {
    return {
      orderKeyAccountIdUnique: unique("order_key_account_id_unique").on(
        table.orderKey,
        table.accountId
      ),
    };
  }
);

export const orderItems = wareboxes.table("order_items", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  qty: integer("qty").notNull(),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  itemBatchId: integer("item_batch_id").references(() => itemBatches.id),
});

export const orderActivity = wareboxes.table("order_activity", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  orderId: integer("order_id").references(() => orders.id),
  action: varchar("action", { length: 255 }).notNull(),
});

export const orderRelationships = relations(orders, ({ one, many }) => ({
  orderItems: many(orderItems, { relationName: "orderItems" }),
  orderActivity: many(orderActivity, { relationName: "orderActivity" }),
  account: one(accounts, {
    fields: [orders.accountId],
    references: [accounts.id],
  }),
  wave: one(pickWaves, {
    fields: [orders.waveId],
    references: [pickWaves.id],
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
}));

export const orderItemRelationships = relations(orderItems, ({ one }) => ({
  orderItems: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
    relationName: "orderItems",
  }),
  itemId: one(items, {
    fields: [orderItems.itemId],
    references: [items.id],
    relationName: "orderItemIds",
  }),
  itemBatch: one(itemBatches, {
    fields: [orderItems.itemBatchId],
    references: [itemBatches.id],
  }),
}));

export const orderActivityRelationships = relations(
  orderActivity,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderActivity.orderId],
      references: [orders.id],
      relationName: "orderActivity",
    }),
  })
);

export type SelectOrder = Partial<SelectAddress> & typeof orders.$inferSelect & {
  orderItems?: SelectOrderItem[];
};

export type InsertOrder = Partial<InsertAddress> & typeof orders.$inferInsert & {
  orderItems?: InsertOrderItem[];
};

export type SelectOrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
