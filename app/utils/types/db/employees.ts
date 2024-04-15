import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { wareboxes } from "./base";
import { warehouses } from "./locations";
import { users } from "./users";

export const employeeTypes = pgEnum("employee_type", [
  "full_time",
  "part_time",
  "contractor",
]);

export const employees = wareboxes.table("employees", {
  id: serial("id").primaryKey().notNull(),
  created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
  deleted: timestamp("deleted", { mode: "string" }),
  userId: integer("user_id").references(() => users.id),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  title: varchar("title").notNull(),
  type: employeeTypes("type").notNull(),
  hired: timestamp("hired", { mode: "string" }).notNull(),
  terminated: timestamp("terminated", { mode: "string" }),
});

export const employeeWarehouses = wareboxes.table(
  "employee_warehouses",
  {
    id: serial("id").primaryKey().notNull(),
    created: timestamp("created", { mode: "string" }).defaultNow().notNull(),
    deleted: timestamp("deleted", { mode: "string" }),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id),
    warehouseId: integer("warehouse_id")
      .notNull()
      .references(() => warehouses.id),
  },
  (table) => {
    return {
      employeeWarehousesEmployeeIdWarehouseIdKey: unique(
        "employee_warehouses_employeeId_warehouseId_key"
      ).on(table.employeeId, table.warehouseId),
    };
  }
);

export const employeeWarehousesRelations = relations(
  employeeWarehouses,
  ({ one }) => ({
    employees: one(employees, {
      fields: [employeeWarehouses.employeeId],
      references: [employees.id],
    }),
    warehouses: one(warehouses, {
      fields: [employeeWarehouses.warehouseId],
      references: [warehouses.id],
    }),
  })
);

export const employeeRelations = relations(employees, ({ one }) => ({
  users: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
}));
