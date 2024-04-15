import { integer, serial, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { addresses, wareboxes } from "./base";

export const locationType = pgEnum("location_type", ['cart', 'staging', 'dock', 'bin', 'rack', 'pallet'])

export const warehouses = wareboxes.table("warehouses", {
	id: serial("id").primaryKey().notNull(),
	created: timestamp("created", { mode: 'string' }).defaultNow().notNull(),
	deleted: timestamp("deleted", { mode: 'string' }),
	name: varchar("name"),
	addressId: integer("address_id").references(() => addresses.id),
});

export const locations = wareboxes.table("locations", {
	id: serial("id").primaryKey().notNull(),
	created: timestamp("created", { mode: 'string' }).defaultNow().notNull(),
	deleted: timestamp("deleted", { mode: 'string' }),
	name: varchar("name"),
	warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id),
	type: locationType("type"),
});

export const locationInstances = wareboxes.table("location_instances", {
	id: serial("id").primaryKey().notNull(),
	created: timestamp("created", { mode: 'string' }).defaultNow().notNull(),
	deleted: timestamp("deleted", { mode: 'string' }),
	locationId: integer("location_id").references(() => locations.id),
	palletId: integer("pallet_id").references(() => locations.id),
	binId: integer("bin_id").references(() => locations.id),
	cartId: integer("cart_id").references(() => locations.id),
});