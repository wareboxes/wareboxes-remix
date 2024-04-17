import { Button, Grid, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useLoaderData } from "@remix-run/react";
import {
  MRT_Cell,
  MRT_Row,
  MRT_TableOptions,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useCallback, useMemo, useState } from "react";
import { LocaleTimeCell } from "~/components/Table/LocaleTimeCell";
import TableV1 from "~/components/Table/Table";
import { SelectRole as Role } from "~/utils/types/db/users";
import { Actions } from "./Actions";
import { ChildRolesModal } from "./ChildRolesModal";
import { action, loader } from "./route.server";

export { action, loader };

export default function AdminRoles() {
  const [opened, { open, close }] = useDisclosure();
  const [selectedRow, setSelectedRow] = useState<Pick<Role, "id"> | null>(null);
  const { roles } = useLoaderData<{ roles: Role[] }>() || { roles: [] };
  const { updater } = Actions();

  const updateRole: MRT_TableOptions<Role>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    const formData = new FormData();
    formData.append("roleId", values.id);
    Object.entries(values).forEach(([key, value]) => {
      if (value != null) formData.append(key, value.toString());
    });
    updater.submit(formData);
    table.setEditingRow(null);
  };

  const openChildRolesModal = useCallback(
    (row: MRT_Row<Role>) => {
      open();
      setSelectedRow({ id: row.original.id });
    },
    [setSelectedRow, open]
  );

  const columns = useMemo<MRT_ColumnDef<Role>[]>(
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
        enableEditing: (row) => row.original.description !== "Self role",
      },
      {
        header: "Description",
        accessorKey: "description",
        enableEditing: (row) => row.original.description !== "Self role",
      },
      {
        header: "Child Roles",
        accessorKey: "roles",
        enableEditing: false,
        enableSorting: false,
        enableColumnActions: false,
        Edit: () => null,
        Cell: ({ row }: { row: MRT_Row<Role> }) => (
          <Button onClick={() => openChildRolesModal(row)}>Roles</Button>
        ),
      },
      {
        header: "Created",
        accessorKey: "created",
        enableEditing: false,
        Cell: ({ cell }: { cell: MRT_Cell<Role> }) => {
          const created = cell.getValue() as string;
          return <LocaleTimeCell value={created} />;
        },
        Edit: () => null,
      },
      {
        header: "Deleted",
        accessorKey: "deleted",
        enableEditing: false,
        Cell: ({ cell }: { cell: MRT_Cell<Role> }) => {
          const deleted = cell.getValue() as string;
          return <LocaleTimeCell value={deleted} />;
        },
        Edit: () => null,
      },
    ],
    [openChildRolesModal]
  );

  return (
    <Grid mt="xs">
      <ChildRolesModal
        opened={opened}
        close={close}
        roles={roles}
        row={roles.find((role) => role.id === selectedRow?.id) || null}
      />
      <Grid.Col span={12}>
        <TableV1
          data={roles}
          columns={columns}
          updateData={updateRole}
          deleteDataAction="roleDelete"
          restoreDataAction="roleRestore"
          tableId="roleId"
          editModalTitle="Edit Role"
          columnVisibility={{
            id: false,
          }}
          deleteModalTitle={(row) => `Delete Role - ${row.original.name}`}
          deleteConfirmComponent={(row) => (
            <Text>Are you sure you want to delete {row.original.name}?</Text>
          )}
          canEditRow={(row: MRT_Row<Role>) => ({
            edit: row.original.description !== "Self role",
            reason: "Self role cannot be edited",
          })}
          canDeleteRow={(row: MRT_Row<Role>) => ({
            delete: row.original.description !== "Self role",
            reason: "Self role cannot be deleted",
          })}
        />
      </Grid.Col>
    </Grid>
  );
}
