import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";
import { wareboxes } from "./base";
import { items } from "./items";
import { locations } from "./locations";
import { users } from "./users";

export const status = pgEnum("count_status", [
  "pending",
  "approved",
  "rejected",
  "adjusted",
]);

export const auditWaves = wareboxes.table("audit_waves", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  name: varchar("name"),
  description: text("description"),
});

export const auditWaveItems = wareboxes.table("audit_wave_items", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  auditWaveId: integer("audit_wave_id")
    .notNull()
    .references(() => auditWaves.id),
});

export const auditWaveAccounts = wareboxes.table("audit_wave_accounts", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
  auditWaveId: integer("audit_wave_id")
    .notNull()
    .references(() => auditWaves.id),
});

export const auditWaveLocations = wareboxes.table("audit_wave_locations", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  started: timestamp("started", { mode: "string" }),
  ended: timestamp("ended", { mode: "string" }),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id),
  auditWaveId: integer("audit_wave_id")
    .notNull()
    .references(() => auditWaves.id),
  auditorId: integer("auditor_id").references(() => users.id),
});

export const auditLocationCounts = wareboxes.table("audit_location_counts", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  started: timestamp("started", { mode: "string" }),
  ended: timestamp("ended", { mode: "string" }),
  auditId: integer("audit_id")
    .notNull()
    .references(() => auditWaves.id),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  lot: varchar("lot"),
  expiration: timestamp("expiration", { mode: "string" }),
  serial: varchar("serial"),
  onHand: integer("on_hand").notNull(),
  count: integer("count").notNull(),
  status: status("approval_status").notNull(),
});

export const auditWaveAssignments = wareboxes.table("audit_wave_assignments", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  auditWaveId: integer("audit_wave_id")
    .notNull()
    .references(() => auditWaves.id),
  auditorId: integer("auditor_id")
    .notNull()
    .references(() => users.id),
});

export const auditWaveRelations = relations(auditWaves, ({ many }) => ({
  auditWaveItems: many(auditWaveItems),
  auditWaveAccounts: many(auditWaveAccounts),
  auditWaveLocations: many(auditWaveLocations),
  auditWaveAssignments: many(auditWaveAssignments),
}));

export const auditWaveItemsRelations = relations(auditWaveItems, ({ one }) => ({
  item: one(items, {
    fields: [auditWaveItems.itemId],
    references: [items.id],
  }),
  wave: one(auditWaves, {
    fields: [auditWaveItems.auditWaveId],
    references: [auditWaves.id],
  }),
}));

export const auditWaveAccountsRelations = relations(
  auditWaveAccounts,
  ({ one }) => ({
    account: one(accounts, {
      fields: [auditWaveAccounts.accountId],
      references: [accounts.id],
    }),
    wave: one(auditWaves, {
      fields: [auditWaveAccounts.auditWaveId],
      references: [auditWaves.id],
    }),
  })
);

export const auditWaveLocationsRelations = relations(
  auditWaveLocations,
  ({ one }) => ({
    location: one(locations, {
      fields: [auditWaveLocations.locationId],
      references: [locations.id],
    }),
    wave: one(auditWaves, {
      fields: [auditWaveLocations.auditWaveId],
      references: [auditWaves.id],
    }),
    auditor: one(users, {
      fields: [auditWaveLocations.auditorId],
      references: [users.id],
    }),
  })
);

export const auditLocationCountsRelations = relations(
  auditLocationCounts,
  ({ one }) => ({
    wave: one(auditWaves, {
      fields: [auditLocationCounts.auditId],
      references: [auditWaves.id],
    }),
    location: one(locations, {
      fields: [auditLocationCounts.locationId],
      references: [locations.id],
    }),
    item: one(items, {
      fields: [auditLocationCounts.itemId],
      references: [items.id],
    }),
  })
);

export const auditWaveAssignmentsRelations = relations(
  auditWaveAssignments,
  ({ one }) => ({
    wave: one(auditWaves, {
      fields: [auditWaveAssignments.auditWaveId],
      references: [auditWaves.id],
    }),
    auditor: one(users, {
      fields: [auditWaveAssignments.auditorId],
      references: [users.id],
    }),
  })
);
