import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  serial,
  timestamp,
  unique,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { accounts, type SelectAccount } from "./accounts";
import { wareboxes } from "./base";

export const users = wareboxes.table("users", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: varchar("email").notNull().unique(),
  nickName: varchar("nick_name"),
  phone: varchar("phone"),
});

export const roles = wareboxes.table(
  "roles",
  {
    id: serial("id").primaryKey().notNull(),
    created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
    deleted: timestamp("deleted", { mode: "string" }),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 255 }),
    parentId: integer("parent_id").references((): AnyPgColumn => roles.id),
  },
  (table) => {
    return {
      rolesParentIdKey: index("roles_parent_id_key").on(table.parentId),
    };
  }
);

export const userRoles = wareboxes.table(
  "user_roles",
  {
    id: serial("id").primaryKey().notNull(),
    created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
    deleted: timestamp("deleted", { mode: "string" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id),
  },
  (table) => {
    return {
      idxUserRolesRoleId: index("idx_user_roles_roleId").on(table.roleId),
      idxUserRolesUserId: index("idx_user_roles_userId").on(table.userId),
      userRolesUserIdRoleIdKey: unique("user_roles_userId_roleId_key").on(
        table.userId,
        table.roleId
      ),
    };
  }
);

export const permissions = wareboxes.table("permissions", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
});

export const rolePermissions = wareboxes.table(
  "role_permissions",
  {
    id: serial("id").primaryKey().notNull(),
    created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
    deleted: timestamp("deleted", { mode: "string" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id),
  },
  (table) => {
    return {
      rolePermissionsRoleIdPermissionIdKey: unique(
        "role_permissions_roleId_permissionId_key"
      ).on(table.roleId, table.permissionId),
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

export const userRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  userAccounts: many(userAccounts),
}));

export const roleRelations = relations(roles, ({ one, many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
  parentRole: one(roles, {
    fields: [roles.parentId],
    references: [roles.id],
  }),
}));

export const userRoleRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const rolePermissionRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);

export const permissionRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const userAccountRelations = relations(userAccounts, ({ one }) => ({
  user: one(users, {
    fields: [userAccounts.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [userAccounts.accountId],
    references: [accounts.id],
  }),
}));

export type SelectUser = typeof users.$inferSelect & {
  userRoles?: SelectRole[];
  userAccounts?: SelectAccount[];
  userPermissions?: SelectPermission[];
};

export type InsertUser = typeof users.$inferInsert;

export type SelectRole = typeof roles.$inferSelect & {
  childRoles?: SelectRole[];
  rolePermissions?: SelectPermission[];
};
export type InsertRole = typeof roles.$inferInsert;

export type SelectUserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;

export type SelectPermission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

export type SelectRolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

export type SelectUserAccount = typeof userAccounts.$inferSelect;
export type InsertUserAccount = typeof userAccounts.$inferInsert;
