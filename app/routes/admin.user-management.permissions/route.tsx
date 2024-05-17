import { Grid, Text } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import { MRT_Cell, MRT_ColumnDef, MRT_TableOptions } from "mantine-react-table";
import { useMemo } from "react";
import { LocaleTimeCell } from "~/components/Table/LocaleTimeCell";
import TableV1 from "~/components/Table/Table";
import { createFormData } from "~/utils/forms";
import { useDataAction } from "~/utils/hooks/useDataAction";
import { SelectPermission as Permission } from "~/utils/types/db/users";
import { PermissionActions } from "./Actions";
import { action, loader } from "./route.server";

export { action, loader };

export default function AdminPermissions() {
  const { permissions } = useLoaderData<{
    permissions: Permission[];
  }>() || { permissions: [] };

  const updater = useDataAction({
    dataAction: PermissionActions.UpdatePermission,
    notificationMessages: {
      successMessage: "Permission updated successfully",
    },
  });

  const updatePermission: MRT_TableOptions<Permission>["onEditingRowSave"] =
    async ({ values }) => {
      const formData = createFormData("permissionId", values);
      updater.submit(formData);
    };

  const columns = useMemo<MRT_ColumnDef<Permission>[]>(
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
        enableEditing: false,
      },
      {
        header: "Description",
        accessorKey: "description",
      },
      {
        header: "Created",
        accessorKey: "created",
        enableEditing: false,
        Edit: () => null,
        Cell: ({ cell }: { cell: MRT_Cell<Permission> }) => {
          const created = cell.getValue() as string;
          return <LocaleTimeCell value={created} />;
        },
      },
      {
        header: "Deleted",
        accessorKey: "deleted",
        enableEditing: false,
        Edit: () => null,
        Cell: ({ cell }: { cell: MRT_Cell<Permission> }) => {
          const deleted = cell.getValue() as string;
          return <LocaleTimeCell value={deleted} />;
        },
      },
    ],
    []
  );

  return (
    <Grid mt="xs">
      <Grid.Col span={12}>
        <TableV1
          data={permissions}
          columns={columns}
          updateData={updatePermission}
          deleteDataAction={PermissionActions.DeletePermission}
          restoreDataAction={PermissionActions.RestorePermission}
          tableId="permissionId"
          editModalTitle={(row) => `Edit Permission - ${row.original.name}`}
          deleteModalTitle={(row) => `Delete Permission - ${row.original.name}`}
          deleteConfirmComponent={(row) => (
            <Text>Are you sure you want to delete {row.original.name}?</Text>
          )}
        />
      </Grid.Col>
    </Grid>
  );
}
