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
import {
  SelectPermission as Permission,
  SelectRole as Role,
} from "~/utils/types/db/users";
import { Actions } from "./Actions";
import { ChildRolesModal } from "./ChildRolesModal";
import { PermissionsModal } from "./PermissionsModal";
import { action, loader } from "./route.server";

export { action, loader };

export type ExtendedPermission = Permission & {
  roleId: number;
  roleName: string;
};

export type ExtendedRole = Role & {
  rolePermissions: ExtendedPermission[];
};

export default function AdminRoles() {
  const [childRolesModalOpened, ChildRolesModalHandler] = useDisclosure();
  const [permissionModalOpened, PermissionModalHandler] = useDisclosure();
  const [selectedRow, setSelectedRow] = useState<Pick<
    ExtendedRole,
    "id"
  > | null>(null);
  const { roles, permissions } = useLoaderData<{
    roles: ExtendedRole[];
    permissions: Permission[];
  }>() || { roles: [], permissions: [] };
  const { updater } = Actions();

  const updateRole: MRT_TableOptions<ExtendedRole>["onEditingRowSave"] =
    async ({ values, table }) => {
      const formData = new FormData();
      formData.append("roleId", values.id);
      Object.entries(values).forEach(([key, value]) => {
        if (value != null) formData.append(key, value.toString());
      });
      updater.submit(formData);
      table.setEditingRow(null);
    };

  const openChildRolesModal = useCallback(
    (row: MRT_Row<ExtendedRole>) => {
      ChildRolesModalHandler.open();
      setSelectedRow({ id: row.original.id });
    },
    [ChildRolesModalHandler]
  );

  const openPermissionModal = useCallback(
    (row: MRT_Row<ExtendedRole>) => {
      PermissionModalHandler.open();
      setSelectedRow({ id: row.original.id });
    },
    [PermissionModalHandler]
  );

  const columns = useMemo<MRT_ColumnDef<ExtendedRole>[]>(
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
        accessorKey: "childRoles",
        enableEditing: false,
        enableSorting: false,
        enableColumnActions: false,
        Edit: () => null,
        Cell: ({ row }: { row: MRT_Row<ExtendedRole> }) => (
          <Button onClick={() => openChildRolesModal(row)}>Roles</Button>
        ),
      },
      {
        header: "Permissions",
        accessorKey: "rolePermissions",
        enableEditing: false,
        enableSorting: false,
        enableColumnActions: false,
        Edit: () => null,
        Cell: ({ row }: { row: MRT_Row<ExtendedRole> }) => (
          <Button onClick={() => openPermissionModal(row)}>Permissions</Button>
        ),
      },
      {
        header: "Created",
        accessorKey: "created",
        enableEditing: false,
        Cell: ({ cell }: { cell: MRT_Cell<ExtendedRole> }) => {
          const created = cell.getValue() as string;
          return <LocaleTimeCell value={created} />;
        },
        Edit: () => null,
      },
      {
        header: "Deleted",
        accessorKey: "deleted",
        enableEditing: false,
        Cell: ({ cell }: { cell: MRT_Cell<ExtendedRole> }) => {
          const deleted = cell.getValue() as string;
          return <LocaleTimeCell value={deleted} />;
        },
        Edit: () => null,
      },
    ],
    [openChildRolesModal, openPermissionModal]
  );

  return (
    <Grid mt="xs">
      <ChildRolesModal
        opened={childRolesModalOpened}
        close={ChildRolesModalHandler.close}
        roles={roles}
        row={roles.find((role) => role.id === selectedRow?.id) || null}
      />
      <PermissionsModal
        opened={permissionModalOpened}
        close={PermissionModalHandler.close}
        permissions={permissions}
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
          canEditRow={(row: MRT_Row<ExtendedRole>) => ({
            edit: row.original.description !== "Self role",
            reason: "Self role cannot be edited",
          })}
          canDeleteRow={(row: MRT_Row<ExtendedRole>) => ({
            delete: row.original.description !== "Self role",
            reason: "Self role cannot be deleted",
          })}
        />
      </Grid.Col>
    </Grid>
  );
}
