import { integer, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { wareboxes } from "./base";
import { itemBatches } from "./inventory";

export const boxes = wareboxes.table("boxes", {
	id: serial("id").primaryKey().notNull(),
	created: timestamp("created", { mode: 'string' }).defaultNow().notNull(),
	deleted: timestamp("deleted", { mode: 'string' }),
	barcode: varchar("barcode"),
	dimsId: integer("dims_id"),
});

export const boxItems = wareboxes.table("box_items", {
	id: serial("id").primaryKey().notNull(),
	created: timestamp("created", { mode: 'string' }).defaultNow().notNull(),
	deleted: timestamp("deleted", { mode: 'string' }),
	boxId: integer("box_id").references(() => boxes.id),
	itemBatchId: integer("item_batch_id").notNull().references(() => itemBatches.id),
});