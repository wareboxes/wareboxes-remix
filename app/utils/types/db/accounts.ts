import {
  serial,
  integer,
  timestamp,
  varchar,
  boolean,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";
import { wareboxes } from "./base";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { warehouses } from "./locations";
import { loads } from "./loads";
import { orders } from "./orders";

export const accountPermissions = pgEnum("account_permissions", [
  "modify_orders",
  "read_orders",
  "modify_loads",
  "read_loads",
  "modify_account_info",
  "read_account_info",
  "modify_account_users",
  "read_account_users",
  "modify_returns",
  "read_returns",
]);

export const accounts = wareboxes.table("accounts", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  name: varchar("name", { length: 255 }).notNull(),
});

export const accountTokens = wareboxes.table("account_tokens", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  token: varchar("token", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }),
  expires: timestamp("expires", { mode: "string" }).notNull(),
});

export const accountTokenPermissions = wareboxes.table("account_token_permissions", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  accountTokenId: integer("account_token_id").notNull().references(() => accountTokens.id),
  permission: accountPermissions("permission").notNull(),
});

export const accountWarehouses = wareboxes.table(
  "account_warehouses",
  {
    id: serial("id").primaryKey().notNull(),
    created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
    deleted: timestamp("deleted", { mode: "string" }),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    warehouseId: integer("warehouse_id")
      .notNull()
      .references(() => warehouses.id),
  },
  (table) => {
    return {
      accountWarehousesAccountIdWarehouseIdKey: unique(
        "account_warehouses_accountId_warehouseId_key"
      ).on(table.accountId, table.warehouseId),
    };
  }
);

export const userAccounts = wareboxes.table(
  "user_accounts",
  {
    id: serial("id").primaryKey().notNull(),
    created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
    deleted: timestamp("deleted", { mode: "string" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    isPrimary: boolean("is_primary").default(false).notNull(),
  },
  (table) => {
    return {
      userAccountsUseridAccountidKey: unique(
        "user_accounts_userId_accountId_key"
      ).on(table.userId, table.accountId),
    };
  }
);

export const accountRelations = relations(accounts, ({ many }) => ({
  accountWarehouses: many(accountWarehouses),
  userAccounts: many(userAccounts),
  loads: many(loads),
  orders: many(orders),

}));

export const accountWarehouseRelations = relations(accountWarehouses, ({ one }) => ({
  account: one(accounts, {
    fields: [accountWarehouses.accountId],
    references: [accounts.id],
  }),
  warehouse: one(warehouses, {
    fields: [accountWarehouses.warehouseId],
    references: [warehouses.id],
  }),
}));

export const userAccountRelations = relations(userAccounts, ({ one }) => ({
  user: one(users, {
    fields: [userAccounts.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [userAccounts.accountId],
    references: [accounts.id],
  })
}));

export const accountTokenRelations = relations(accountTokens, ({ one, many }) => ({
  account: one(accounts, {
    fields: [accountTokens.accountId],
    references: [accounts.id],
  }),
  permissions: many(accountTokenPermissions),
}));

export const accountTokenPermissionRelations = relations(accountTokenPermissions, ({ one }) => ({
  accountToken: one(accountTokens, {
    fields: [accountTokenPermissions.accountTokenId],
    references: [accountTokens.id],
  }),
}));


export type SelectAccount = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;