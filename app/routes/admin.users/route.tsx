import { Button, Loader, Text } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import {
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableOptions,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { useCallback, useMemo, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { EditModal } from "~/components/Table/EditModal";
import { RowActions } from "~/components/Table/RowActions";
import { useDataAction } from "~/utils/hooks/useDataAction";
import { SelectRole as Role, SelectUser as User } from "~/utils/types/db/users";
import { RolesModal } from "./RolesModal";
import { action, loader } from "./route.server";

export { action, loader };

export default function AdminUsers() {
  const [selectedRow, setSelectedRow] = useState<Pick<User, "id"> | null>(null);
  const { users, roles } = useLoaderData<{ users: User[]; roles: Role[] }>();

  const updater = useDataAction({
    action: "update",
    notificationMessages: {
      successMessage: "User updated successfully",
    },
  });
  const deleter = useDataAction({
    action: "delete",
    notificationMessages: {
      successMessage: "User deleted successfully",
    },
  });
  const restorer = useDataAction({
    action: "restore",
    notificationMessages: {
      successMessage: "User restored successfully",
    },
  });
  const userRoleDeleter = useDataAction({
    action: "deleteUserRole",
    notificationMessages: {
      successMessage: "User role deleted successfully",
    },
  });

  const deleteUser = async (userId: string) => {
    const formData = new FormData();
    formData.append("userId", userId);
    deleter.performAction(formData);
  };

  const restoreUser = async (userId: string) => {
    const formData = new FormData();
    formData.append("userId", userId);
    restorer.performAction(formData);
  };

  const updateUser: MRT_TableOptions<User>["onEditingRowSave"] = async ({
    values,
  }) => {
    const formData = new FormData();
    formData.append("userId", values.id);
    Object.entries(values).forEach(([key, value]) => {
      if (value != null) formData.append(key, value.toString());
    });
    updater.performAction(formData);
    table.setEditingRow(null);
  };

  const deleteUserRole = useCallback(
    async (userId: string, roleId: string) => {
      const formData = new FormData();
      formData.append("intent", "deleteUserRole");
      formData.append("userId", userId);
      formData.append("roleId", roleId);
      userRoleDeleter.performAction(formData);
    },
    [userRoleDeleter]
  );

  const openRolesModal = useCallback(
    (row: MRT_Row<User>) => {
      setSelectedRow({ id: row.original.id });
    },
    [setSelectedRow]
  );

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        enableEditing: false,
      },
      {
        header: "Email",
        accessorKey: "email",
        enableEditing: false,
      },
      {
        header: "First Name",
        accessorKey: "firstName",
      },
      {
        header: "Last Name",
        accessorKey: "lastName",
      },
      {
        header: "Nick Name",
        accessorKey: "nickName",
      },
      {
        header: "Phone",
        accessorKey: "phone",
      },
      {
        header: "Created",
        accessorKey: "created",
        Cell: ({ cell }: { cell: MRT_Cell<User, unknown> }) => {
          const created = cell.getValue() as string;
          return (
            <ClientOnly fallback={<Loader />}>
              {() => new Date(created).toLocaleString()}
            </ClientOnly>
          );
        },
        enableEditing: false,
      },
      {
        header: "Deleted",
        accessorKey: "deleted",
        Cell: ({ cell }: { cell: MRT_Cell<User, unknown> }) => {
          const deleted = cell.getValue() as string;
          return deleted ? (
            <ClientOnly fallback={<Loader />}>
              {() => new Date(deleted).toLocaleString()}
            </ClientOnly>
          ) : (
            ""
          );
        },
        enableEditing: false,
      },
      {
        header: "Roles",
        accessorKey: "roles",
        enableEditing: false,
        Cell: ({ row }: { row: MRT_Row<User> }) => {
          return <Button onClick={() => openRolesModal(row)}>Roles</Button>;
        },
        Edit: () => null,
      },
    ],
    [openRolesModal]
  );

  const table = useMantineReactTable({
    columns,
    data: users,
    initialState: {
      density: "xs",
      pagination: {
        pageIndex: 0,
        pageSize: 500,
      },
      showGlobalFilter: true,
      columnVisibility: {
        id: false,
        firstName: false,
        lastName: false,
        nickName: false,
        phone: false,
      },
    },
    positionGlobalFilter: "left",
    autoResetAll: false,
    enableEditing: true,
    onEditingRowSave: updateUser,
    renderRowActions: ({ row, table }) => (
      <RowActions
        row={row}
        table={table}
        onDelete={(id) => deleteUser(id)}
        onRestore={(id) => restoreUser(id)}
        getDeleteConfirmMessage={(row) => (
          <Text>
            Are you sure you want to delete {row.original.firstName}{" "}
            {row.original.lastName}?
          </Text>
        )}
      />
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <EditModal
        table={table}
        row={row}
        internalEditComponents={internalEditComponents}
        title="Edit User"
      />
    ),
    mantineTableProps: {
      striped: true,
    },
  });

  return (
    <>
      <RolesModal
        roles={roles}
        row={users.find((user) => user.id === selectedRow?.id) || null}
        setSelectedRow={setSelectedRow}
        deleteUserRole={deleteUserRole}
      />
      <MantineReactTable table={table} />
    </>
  );
}
