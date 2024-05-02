import { Button, Grid, Text } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import {
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableOptions,
} from "mantine-react-table";
import { useMemo } from "react";
import { LocaleTimeCell } from "~/components/Table/LocaleTimeCell";
import TableV1 from "~/components/Table/Table";
import { createFormData } from "~/utils/forms";
import useModal from "~/utils/hooks/useModal";
import { SelectAccount as Account } from "~/utils/types/db/accounts";
import { SelectWarehouse as Warehouse } from "~/utils/types/db/locations";
import { Actions } from "./Actions";
import { WarehousesModal } from "./WarehousesModal";
import { action, loader } from "./route.server";

export { action, loader };

export default function AdminAccounts() {
  const warehousesModal = useModal();
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
    const formData = createFormData("accountId", values);
    updater.submit(formData);
  };

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
            <Button onClick={() => warehousesModal.openModal(row.original.id)}>Warehouses</Button>
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
    [warehousesModal]
  );

  return (
    <Grid mt="xs">
      <WarehousesModal
        opened={warehousesModal.isModalOpen}
        close={warehousesModal.closeModal}
        warehouses={warehouses}
        row={accounts.find((account) => account.id === warehousesModal.selectedId) || null}
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
