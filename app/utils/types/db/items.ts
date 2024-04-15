import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { accounts } from "./accounts";
import { wareboxes } from "./base";

export const packagingUnit = pgEnum("packaging_unit", [
  "unit_load",
  "bulk",
  "bin",
  "tote",
  "tube",
  "roll",
  "bundle",
  "carton",
  "skid",
  "pallet",
  "master_case",
  "inner_pack",
  "case",
  "pack",
  "each",
]);
export const weightUom = pgEnum("weight_uom", [
  "oz",
  "lb",
  "uk_ton",
  "us_ton",
  "tonne",
  "kg",
  "g",
]);
export const lengthUom = pgEnum("length_uom", ["mm", "m", "cm", "ft", "in"]);

export const items = wareboxes.table("items", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  description: varchar("description"),
  notes: text("notes"),
  packagingUnit: packagingUnit("packagingUnit").notNull(),
  dimsId: integer("dimsId")
    .notNull()
    .references(() => dims.id, { onDelete: "cascade" }),
  palletHi: integer("palletHi"),
  palletTi: integer("palletTi"),
  innerUnits: integer("innerUnits"),
});

export const dims = wareboxes.table("dims", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  length: integer("length"),
  width: integer("width"),
  height: integer("height"),
  lengthUom: lengthUom("length_uom"),
  weight: integer("weight"),
  weightUom: weightUom("weight_uom"),
});

export const skus = wareboxes.table("skus", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  name: varchar("name").notNull(),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  notes: text("notes"),
});

export const upcs = wareboxes.table("upcs", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  upc: varchar("upc").notNull(),
});

export const accountItems = wareboxes.table("account_items", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
});

export const itemRelations = relations(items, ({ one, many }) => ({
  dims: one(dims, {
    fields: [items.dimsId],
    references: [dims.id],
  }),
  skus: many(skus),
  upcs: many(upcs),
}));

export const skuRelations = relations(skus, ({ one }) => ({
  item: one(items, {
    fields: [skus.itemId],
    references: [items.id],
  }),
}));

export const upcRelations = relations(upcs, ({ one }) => ({
  item: one(items, {
    fields: [upcs.itemId],
    references: [items.id],
  }),
}));

export const dimsRelations = relations(dims, ({ one }) => ({
  item: one(items, {
    fields: [dims.id],
    references: [items.dimsId],
  }),
}));

export const accountItemRelations = relations(accountItems, ({ one }) => ({
  account: one(accounts, {
    fields: [accountItems.accountId],
    references: [accounts.id],
  }),
  item: one(items, {
    fields: [accountItems.itemId],
    references: [items.id],
  }),
}));

export type SelectItem = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;

export type SelectDim = typeof dims.$inferSelect;
export type InsertDim = typeof dims.$inferInsert;

export type SelectSku = typeof skus.$inferSelect;
export type InsertSku = typeof skus.$inferInsert;

export type SelectAccountItem = typeof accountItems.$inferSelect;
export type InsertAccountItem = typeof accountItems.$inferInsert;

export type SelectItemSkuDim = Omit<SelectItem, "id"> & SelectDim & SelectSku;

export const insertItemSchema = createInsertSchema(items, {
  dimsId: (schema) => schema.dimsId.optional(),
});

export const insertDimSchema = createInsertSchema(dims);

export const insertSkuSchema = createInsertSchema(skus, {
  itemId: (schema) => schema.itemId.optional(),
});

export const selectItemSchema = createSelectSchema({
  ...dims,
  ...skus,
  ...items,
});

export const importItemSchema = z.object({
  id: z.coerce.number().optional(),
  dimsId: z.coerce.number().optional(),
  name: z.string().min(3),
  description: z.string().min(3),
  notes: z.string().min(3).optional(),
  length: z.coerce.number().min(0.25),
  width: z.coerce.number().min(0.25),
  height: z.coerce.number().min(0.25),
  lengthUom: z.enum(lengthUom.enumValues),
  weight: z.coerce.number().min(0.25),
  weightUom: z.enum(weightUom.enumValues),
  packagingUnit: z.enum(packagingUnit.enumValues),
  innerUnits: z.coerce.number().optional(),
  palletHi: z.coerce.number().optional(),
  palletTi: z.coerce.number().optional(),
});

export const itemIdSchema = z.object({
  id: z.number(),
});
