import { Loader, Text } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import {
  MRT_Cell,
  MRT_TableOptions,
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useMemo } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { EditModal } from "~/components/Table/EditModal";
import { RowActions } from "~/components/Table/RowActions";
import { useDataAction } from "~/utils/hooks/useDataAction";
import { SelectRole as Role } from "~/utils/types/db/users";
import { action, loader } from "./route.server";

export { action, loader };

export default function AdminRoles() {
  const { roles } = useLoaderData<{ roles: Role[] }>();
  const deleter = useDataAction({
    action: "delete",
    notificationMessages: {
      successMessage: "Role deleted successfully",
    },
  });
  const updater = useDataAction({
    action: "update",
    notificationMessages: {
      successMessage: "Role updated successfully",
    },
  });
  const restorer = useDataAction({
    action: "restore",
    notificationMessages: {
      successMessage: "Role restored successfully",
    },
  });

  const deleteRole = async (roleId: string) => {
    const formData = new FormData();
    formData.append("roleId", roleId);
    deleter.performAction(formData);
  };

  const restoreRole = async (roleId: number) => {
    const formData = new FormData();
    formData.append("roleId", roleId.toString());
    restorer.performAction(formData);
  };

  const updateRole: MRT_TableOptions<Role>["onEditingRowSave"] = async ({
    values,
  }) => {
    const formData = new FormData();
    formData.append("roleId", values.id);
    Object.entries(values).forEach(([key, value]) => {
      if (value != null) formData.append(key, value.toString());
    });
    updater.performAction(formData);
    table.setEditingRow(null);
  };

  const columns = useMemo<MRT_ColumnDef<Role>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        enableEditing: false,
      },
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Description",
        accessorKey: "description",
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
      },
    ],
    []
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
        onDelete={(id) => deleteRole(id)}
        onRestore={(id) => restoreRole(Number(id))}
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

  return <MantineReactTable table={table} />;
}
