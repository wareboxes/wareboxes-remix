import { Button, Grid, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useLoaderData } from "@remix-run/react";
import {
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableOptions,
} from "mantine-react-table";
import { useCallback, useMemo, useState } from "react";
import { LocaleTimeCell } from "~/components/Table/LocaleTimeCell";
import TableV1 from "~/components/Table/Table";
import { SelectAccount as Account } from "~/utils/types/db/accounts";
import { SelectWarehouse as Warehouse } from "~/utils/types/db/locations";
import { Actions } from "./Actions";
import { WarehousesModal } from "./WarehousesModal";
import { action, loader } from "./route.server";

export { action, loader };

export default function AdminAccounts() {
  const [rolesModalOpened, rolesModalHandler] = useDisclosure();
  const [selectedRow, setSelectedRow] = useState<Pick<Account, "id"> | null>(
    null
  );
  const { accounts, warehouses } = useLoaderData<{
    accounts: Account[];
    warehouses: Warehouse[];
  }>() || {
    accounts: [],
    warehouses: [],
  };
  const { updater } = Actions();

  const updateAccount: MRT_TableOptions<Account>["onEditingRowSave"] = async ({
    values,
  }) => {
    const formData = new FormData();
    formData.append("accountId", values.id);
    Object.entries(values).forEach(([key, value]) => {
      if (value != null) formData.append(key, value.toString());
    });
    updater.submit(formData);
  };

  const openWarehousesModal = useCallback(
    (row: MRT_Row<Account>) => {
      rolesModalHandler.open();
      setSelectedRow({ id: row.original.id });
    },
    [rolesModalHandler]
  );

  const columns = useMemo<MRT_ColumnDef<Account>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        enableEditing: false,
        Edit: () => null,
      },
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Warehouses",
        accessorKey: "warehouses",
        enableEditing: false,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ row }: { row: MRT_Row<Account> }) => {
          return (
            <Button onClick={() => openWarehousesModal(row)}>Warehouses</Button>
          );
        },
        Edit: () => null,
      },
      {
        header: "Created",
        accessorKey: "created",
        Cell: ({ cell }: { cell: MRT_Cell<Account> }) => {
          const created = cell.getValue() as string;
          return <LocaleTimeCell value={created} />;
        },
        Edit: () => null,
        enableEditing: false,
      },
      {
        header: "Deleted",
        accessorKey: "deleted",
        Cell: ({ cell }: { cell: MRT_Cell<Account> }) => {
          const deleted = cell.getValue() as string;
          return <LocaleTimeCell value={deleted} />;
        },
        Edit: () => null,
        enableEditing: false,
      },
    ],
    [openWarehousesModal]
  );

  return (
    <Grid mt="xs">
      <WarehousesModal
        opened={rolesModalOpened}
        close={rolesModalHandler.close}
        warehouses={warehouses}
        row={accounts.find((account) => account.id === selectedRow?.id) || null}
      />
      <Grid.Col span={12}>
        <TableV1
          data={accounts}
          columns={columns}
          updateData={updateAccount}
          deleteDataAction="deleteAccount"
          restoreDataAction="restoreAccount"
          tableId="accountId"
          columnVisibility={{
            id: false,
            firstName: false,
            lastName: false,
            nickName: false,
            phone: false,
          }}
          editModalTitle={(row) => `Edit Account - ${row.original.name}`}
          deleteModalTitle={(row) => `Delete Account - ${row.original.name}`}
          deleteConfirmComponent={(row) => (
            <Text>Are you sure you want to delete {row.original.name} </Text>
          )}
        />
      </Grid.Col>
    </Grid>
  );
}
