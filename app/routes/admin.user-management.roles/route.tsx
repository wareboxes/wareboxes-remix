import { Button, Grid, Text } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import {
  MRT_Cell,
  MRT_Row,
  MRT_TableOptions,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useMemo } from "react";
import { LocaleTimeCell } from "~/components/Table/LocaleTimeCell";
import TableV1 from "~/components/Table/Table";
import { createFormData } from "~/utils/forms";
import useModal from "~/utils/hooks/useModal";
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
  const choldRolesModal = useModal();
  const permissionsModal = useModal();
  const { roles, permissions } = useLoaderData<{
    roles: ExtendedRole[];
    permissions: Permission[];
  }>() || { roles: [], permissions: [] };
  const { updater } = Actions();

  const updateRole: MRT_TableOptions<ExtendedRole>["onEditingRowSave"] =
    async ({ values }) => {
      const formData = createFormData("roleId", values);
      updater.submit(formData);
    };

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
          <Button onClick={() => choldRolesModal.openModal(row.original.id)}>
            Roles
          </Button>
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
          <Button onClick={() => permissionsModal.openModal(row.original.id)}>
            Permissions
          </Button>
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
    [choldRolesModal, permissionsModal]
  );

  return (
    <Grid mt="xs">
      <ChildRolesModal
        opened={choldRolesModal.isModalOpen}
        close={choldRolesModal.closeModal}
        roles={roles}
        row={
          roles.find((role) => role.id === choldRolesModal.selectedId) || null
        }
      />
      <PermissionsModal
        opened={permissionsModal.isModalOpen}
        close={permissionsModal.closeModal}
        permissions={permissions}
        row={
          roles.find((role) => role.id === permissionsModal.selectedId) || null
        }
      />
      <Grid.Col span={12}>
        <TableV1
          data={roles}
          columns={columns}
          updateData={updateRole}
          deleteDataAction="roleDelete"
          restoreDataAction="roleRestore"
          tableId="roleId"
          columnVisibility={{
            id: false,
          }}
          editModalTitle={(row) => `Edit Role - ${row.original.name}`}
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
