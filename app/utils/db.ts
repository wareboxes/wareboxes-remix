import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as baseSchema from "~/utils/types/db/base";
import * as boxesSchema from "~/utils/types/db/boxes";
import * as inventorySchema from "~/utils/types/db/inventory";
import * as itemsSchema from "~/utils/types/db/items";
import * as loadsSchema from "~/utils/types/db/loads";
import * as locationSchema from "~/utils/types/db/locations";
import * as ordersSchema from "~/utils/types/db/orders";
import * as usersSchema from "~/utils/types/db/users";

type GroupedRow<
  MainTable,
  GroupedTables extends keyof MainTable
> = MainTable & {
  [Table in GroupedTables]: MainTable[Table][];
};

export const arrayAgg = <
  MainTable,
  GroupedTables extends keyof MainTable,
  KeyType extends keyof MainTable
>(
  query: MainTable[],
  tableNames: GroupedTables[],
  key: KeyType
): GroupedRow<MainTable, GroupedTables>[] => {
  const rows = query;

  const uniqueRows = new Map<
    MainTable[KeyType],
    GroupedRow<MainTable, GroupedTables>
  >();

  rows.forEach((row) => {
    const rowKey = row[key];
    if (!uniqueRows.has(rowKey)) {
      const groupedRow = { ...row } as GroupedRow<MainTable, GroupedTables>;
      tableNames.forEach((tableName) => {
        groupedRow[tableName] = [] as GroupedRow<
          MainTable,
          GroupedTables
        >[GroupedTables];
      });
      uniqueRows.set(rowKey, groupedRow);
    }
  });

  rows.forEach((row) => {
    const rowKey = row[key];
    const groupedRow = uniqueRows.get(rowKey);
    if (groupedRow) {
      tableNames.forEach((tableName) => {
        const value = row[tableName];
        if (value !== null && value !== undefined) {
          (groupedRow[tableName] as MainTable[typeof tableName][]).push(value);
        }
      });
    }
  });

  return Array.from(uniqueRows.values());
};

const env = process.env;

const queryClient = postgres(
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`
);
export const db = drizzle(queryClient, {
  schema: {
    ...baseSchema,
    ...itemsSchema,
    ...usersSchema,
    ...loadsSchema,
    ...locationSchema,
    ...boxesSchema,
    ...inventorySchema,
    ...ordersSchema,
  },
});
