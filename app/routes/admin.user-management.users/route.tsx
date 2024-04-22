import { Button, Center, Grid, HoverCard, Text } from "@mantine/core";
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
import { SelectRole as Role, SelectUser as User } from "~/utils/types/db/users";
import { Actions } from "./Actions";
import { PermissionsModal } from "./PermissionsModal";
import { PermissionsTable } from "./PermissionsTable";
import { RolesModal } from "./RolesModal";
import { action, loader } from "./route.server";

export { action, loader };

export default function AdminUsers() {
  const [rolesModalOpened, rolesModalHandler] = useDisclosure();
  const [permissionsModalOpened, permissionsModalHandler] = useDisclosure();
  const [selectedRow, setSelectedRow] = useState<Pick<User, "id"> | null>(null);
  const { users, roles } = useLoaderData<{
    users: User[];
    roles: Role[];
  }>() || {
    users: [],
    roles: [],
  };
  const { updater } = Actions();

  const updateUser: MRT_TableOptions<User>["onEditingRowSave"] = async ({
    values,
  }) => {
    const formData = new FormData();
    formData.append("userId", values.id);
    Object.entries(values).forEach(([key, value]) => {
      if (value != null) formData.append(key, value.toString());
    });
    updater.submit(formData);
  };

  const openRolesModal = useCallback(
    (row: MRT_Row<User>) => {
      rolesModalHandler.open();
      setSelectedRow({ id: row.original.id });
    },
    [rolesModalHandler]
  );

  const openPermissionsModal = useCallback(
    (row: MRT_Row<User>) => {
      permissionsModalHandler.open();
      setSelectedRow({ id: row.original.id });
    },
    [permissionsModalHandler]
  );

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        enableEditing: false,
        Edit: () => null,
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
        header: "Roles",
        accessorKey: "roles",
        enableEditing: false,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ row }: { row: MRT_Row<User> }) => {
          return <Button onClick={() => openRolesModal(row)}>Roles</Button>;
        },
        Edit: () => null,
      },
      {
        header: "Permissions",
        accessorKey: "permissions",
        enableEditing: false,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ row }: { row: MRT_Row<User> }) => {
          return (
            <HoverCard withArrow>
              <HoverCard.Target>
                <Button onClick={() => openPermissionsModal(row)}>
                  Permissions
                </Button>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                {row.original.userPermissions?.length ? (
                  <PermissionsTable
                    permissions={row.original.userPermissions}
                  />
                ) : (
                  <Center>No permissions</Center>
                )}
              </HoverCard.Dropdown>
            </HoverCard>
          );
        },
        Edit: () => null,
      },
      {
        header: "Created",
        accessorKey: "created",
        Cell: ({ cell }: { cell: MRT_Cell<User> }) => {
          const created = cell.getValue() as string;
          return <LocaleTimeCell value={created} />;
        },
        Edit: () => null,
        enableEditing: false,
      },
      {
        header: "Deleted",
        accessorKey: "deleted",
        Cell: ({ cell }: { cell: MRT_Cell<User> }) => {
          const deleted = cell.getValue() as string;
          return <LocaleTimeCell value={deleted} />;
        },
        Edit: () => null,
        enableEditing: false,
      },
    ],
    [openPermissionsModal, openRolesModal]
  );

  return (
    <Grid mt="xs">
      <RolesModal
        opened={rolesModalOpened}
        close={rolesModalHandler.close}
        roles={roles}
        row={users.find((user) => user.id === selectedRow?.id) || null}
      />
      <PermissionsModal
        opened={permissionsModalOpened}
        close={permissionsModalHandler.close}
        row={users.find((user) => user.id === selectedRow?.id) || null}
      />
      <Grid.Col span={12}>
        <TableV1
          data={users}
          columns={columns}
          updateData={updateUser}
          deleteDataAction="deleteUser"
          restoreDataAction="restoreUser"
          tableId="userId"
          columnVisibility={{
            id: false,
            firstName: false,
            lastName: false,
            nickName: false,
            phone: false,
          }}
          editModalTitle={(row) => `Edit User - ${row.original.email}`}
          deleteModalTitle={(row) => `Delete User - ${row.original.email}`}
          deleteConfirmComponent={(row) => (
            <Text>
              Are you sure you want to delete {row.original.firstName}{" "}
              {row.original.lastName}?
            </Text>
          )}
        />
      </Grid.Col>
    </Grid>
  );
}