import { pgSchema, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const wareboxes = pgSchema("wareboxes");

export const baseTable = wareboxes.table("base_table", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
});

export const addresses = wareboxes.table("addresses", {
	id: serial("id").primaryKey().notNull(),
	created: timestamp("created", { mode: 'string' }).defaultNow().notNull(),
	deleted: timestamp("deleted", { mode: 'string' }),
	name: varchar("name").notNull(),
	company: varchar("company"),
	line1: varchar("line1").notNull(),
	line2: varchar("line2"),
	postalCode: varchar("postal_code"),
	country: varchar("country").notNull(),
	phone: varchar("phone"),
	email: varchar("email"),
	state: varchar("state"),
	county: varchar("county"),
	city: varchar("city"),
	territory: varchar("territory"),
	district: varchar("district"),
	validated: timestamp("validated", { mode: 'string' }),
});