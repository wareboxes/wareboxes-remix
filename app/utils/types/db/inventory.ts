import { integer, serial, timestamp, varchar, bigint, pgEnum } from "drizzle-orm/pg-core";
import { wareboxes } from "./base";
import { loads } from "./loads";
import { items } from "./items";
import { locationInstances } from "./locations";
import { orders } from "./orders";

export const movementType = pgEnum("movement_type", ['pack', 'ship', 'adjustment', 'transfer', 'pick', 'receive'])

export const itemBatches = wareboxes.table("item_batches", {
	id: serial("id").primaryKey().notNull(),
	created: timestamp("created", { mode: 'string' }).defaultNow().notNull(),
	deleted: timestamp("deleted", { mode: 'string' }),
	itemId: integer("item_id").notNull().references(() => items.id),
	lot: varchar("lot"),
	loadId: integer("load_id").notNull().references(() => loads.id),
	orderId: integer("order_id").references(() => orders.id),
	expiration: timestamp("expiration", { mode: 'string' }),
	serial: varchar("serial"),
});

export const picks = wareboxes.table("picks", {
	id: serial("id").primaryKey().notNull(),
	created: timestamp("created", { mode: 'string' }).defaultNow().notNull(),
	deleted: timestamp("deleted", { mode: 'string' }),
	locationInstanceId: integer("location_instance_id").references(() => locationInstances.id),
	itemIatchId: integer("item_batch_id").references(() => itemBatches.id),
});

export const inventory = wareboxes.table("inventory", {
	qty: bigint("qty", { mode: "number" }),
	locationInstanceId: integer("location_instance_id"),
	itemBatchId: integer("item_batch_id"),
});

export const movements = wareboxes.table("movements", {
	id: serial("id").primaryKey().notNull(),
	created: timestamp("created", { mode: 'string' }).defaultNow().notNull(),
	deleted: timestamp("deleted", { mode: 'string' }),
	modified: timestamp("modified", { mode: 'string' }),
	itemBatchId: integer("item_batch_id").notNull().references(() => itemBatches.id),
	fromLocationId: integer("from_location_id").notNull().references(() => locationInstances.id),
	toLocationId: integer("to_location_id").notNull().references(() => locationInstances.id),
	qty: integer("qty").notNull(),
});