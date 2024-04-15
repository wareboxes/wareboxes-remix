import {
  integer,
  pgEnum,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";
import { wareboxes } from "./base";
import { warehouses } from "./locations";
import { orders } from "./orders";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const loadType = pgEnum("load_type", ["inbound", "outbound"]);

export const loads = wareboxes.table("loads", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  warehouseId: integer("warehouse_id")
    .notNull()
    .references(() => warehouses.id),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
  expected: timestamp("expected_time", { mode: "string" }),
  actual: timestamp("actual_time", { mode: "string" }),
  closed: timestamp("closed", { mode: "string" }),
  type: loadType("type").notNull(),
});

export const loadOrders = wareboxes.table("load_orders", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  loadId: integer("load_id").references(() => loads.id),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
});

export const loadNotes = wareboxes.table("load_notes", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  loadId: integer("load_id").references(() => loads.id),
  note: varchar("note", { length: 255 }).notNull(),
});

export const loadFiles = wareboxes.table("load_files", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  loadId: integer("load_id").references(() => loads.id),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  path: varchar("path", { length: 255 }).notNull(),
});

export const loadItems = wareboxes.table("load_items", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  loadId: integer("load_id").references(() => loads.id),
  sku: varchar("sku", { length: 255 }).notNull(),
});

export const loadActivity = wareboxes.table("load_activity", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  loadId: integer("load_id").references(() => loads.id),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(),
});

export const loadRelations = relations(loads, ({ one, many }) => ({
  accounts: one(accounts, {
    fields: [loads.accountId],
    references: [accounts.id],
  }),
  warehouse: one(warehouses, {
    fields: [loads.warehouseId],
    references: [warehouses.id],
  }),
  orders: many(loadOrders),
  notes: many(loadNotes),
  files: many(loadFiles),
  items: many(loadItems),
  activity: many(loadActivity),
}));

export const loadOrderRelations = relations(loadOrders, ({ one }) => ({
  load: one(loads, {
    fields: [loadOrders.loadId],
    references: [loads.id],
  }),
}));

export const loadNoteRelations = relations(loadNotes, ({ one }) => ({
  load: one(loads, {
    fields: [loadNotes.loadId],
    references: [loads.id],
  }),
}));

export const loadFileRelations = relations(loadFiles, ({ one }) => ({
  load: one(loads, {
    fields: [loadFiles.loadId],
    references: [loads.id],
  }),
}));

export const loadItemRelations = relations(loadItems, ({ one }) => ({
  load: one(loads, {
    fields: [loadItems.loadId],
    references: [loads.id],
  }),
}));

export const loadActivityRelations = relations(loadActivity, ({ one }) => ({
  load: one(loads, {
    fields: [loadActivity.loadId],
    references: [loads.id],
  }),
}));


