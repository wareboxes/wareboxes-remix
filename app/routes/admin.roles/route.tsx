import { Button, Loader, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useLoaderData } from "@remix-run/react";
import {
  MRT_Cell,
  MRT_Row,
  MRT_TableOptions,
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useCallback, useMemo, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { EditModal } from "~/components/Table/EditModal";
import { RowActions } from "~/components/Table/RowActions";
import { SelectRole as Role } from "~/utils/types/db/users";
import { Actions } from "./Actions";
import { ChildRolesModal } from "./ChildRolesModal";
import { action, loader } from "./route.server";

export { action, loader };

export default function AdminRoles() {
  const [opened, { open, close }] = useDisclosure();
  const [selectedRow, setSelectedRow] = useState<Pick<Role, "id"> | null>(null);
  const { roles } = useLoaderData<{ roles: Role[] }>();
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
        Cell: ({ cell }: { cell: MRT_Cell<Role, unknown> }) => {
          const created = cell.getValue() as string;
          return (
            <ClientOnly fallback={<Loader />}>
              {() => new Date(created).toLocaleString()}
            </ClientOnly>
          );
        },
        Edit: () => null,
      },
      {
        header: "Deleted",
        accessorKey: "deleted",
        enableEditing: false,
        Cell: ({ cell }: { cell: MRT_Cell<Role, unknown> }) => {
          const deleted = cell.getValue() as string;
          return deleted ? (
            <ClientOnly fallback={<Loader />}>
              {() => new Date(deleted).toLocaleString()}
            </ClientOnly>
          ) : (
            ""
          );
        },
        Edit: () => null,
      },
    ],
    [openChildRolesModal]
  );

  const table = useMantineReactTable({
    columns,
    data: roles,
    initialState: {
      density: "xs",
      pagination: {
        pageIndex: 0,
        pageSize: 500,
      },
      showGlobalFilter: true,
      columnVisibility: {
        id: false,
      },
    },
    positionGlobalFilter: "left",
    autoResetAll: false,
    enableEditing: true,
    onEditingRowSave: updateRole,
    renderRowActions: ({ row, table }) => (
      <RowActions
        row={row}
        table={table}
        tableId="roleId"
        actions={{ delete: 'roleDelete', restore: 'roleRestore' }}
        getDeleteConfirmMessage={(row) => (
          <Text>Are you sure you want to delete {row.original.name}?</Text>
        )}
      />
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <EditModal
        table={table}
        row={row}
        internalEditComponents={internalEditComponents}
        title="Edit Role"
      />
    ),
    mantineTableProps: {
      striped: true,
    },
  });

  return (
    <>
      <ChildRolesModal
        opened={opened}
        close={close}
        roles={roles}
        row={roles.find((role) => role.id === selectedRow?.id) || null}
      />
      <MantineReactTable table={table} />
    </>
  );
}
