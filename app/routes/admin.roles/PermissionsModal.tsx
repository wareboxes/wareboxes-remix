import { ActionIcon, Center, Input, Modal, Space, Table } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useMemo } from "react";
import { useDataAction } from "~/utils/hooks/useDataAction";
import { SelectPermission as Permission } from "~/utils/types/db/users";
import { RoleActions } from "./Actions";
import { AddPermissionForm } from "./AddPermissionForm";
import { ExtendedPermission, ExtendedRole } from "./route";

export function PermissionsModal({
  opened,
  close,
  permissions,
  row,
}: {
  opened: boolean;
  close: () => void;
  permissions: Permission[];
  row: ExtendedRole | null;
}) {
  const deleter = useDataAction({
    dataAction: RoleActions.DeleteRolePermission,
    notificationMessages: {
      successMessage: "Role permission deleted successfully",
    },
  });

  const filteredPermissions = useMemo(
    () =>
      permissions.filter(
        (permission) =>
          !row?.rolePermissions.find(
            (rolePermission) => rolePermission.id === permission.id
          )
      ),
    [permissions, row?.rolePermissions]
  );

  return (
    <Modal opened={opened} onClose={close} title={`Permissions - ${row?.name}`}>
      {filteredPermissions?.length > 0 && (
        <Center>
          <AddPermissionForm
            row={row}
            filteredPermissions={filteredPermissions}
          />
          <Space h="md" />
        </Center>
      )}
      {row?.rolePermissions?.length ? (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Actions</Table.Th>
              <Table.Th>Permission</Table.Th>
              <Table.Th>Role</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {row.rolePermissions.map((permission: ExtendedPermission) => (
              <Table.Tr key={permission.id}>
                <Table.Td>
                  <deleter.Form method="POST">
                    <Input
                      type="hidden"
                      name="action"
                      value={RoleActions.DeleteRolePermission}
                    />
                    <Input type="hidden" name="roleId" value={row.id} />
                    <Input
                      type="hidden"
                      name="permissionId"
                      value={permission.id}
                    />
                    {permission.roleId === row.id && (
                      <ActionIcon
                        variant="outline"
                        color="red"
                        disabled={deleter.submitting}
                        type="submit"
                      >
                        <IconTrash />
                      </ActionIcon>
                    )}
                  </deleter.Form>
                </Table.Td>
                <Table.Td>{permission.name}</Table.Td>
                <Table.Td>{permission.roleName}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Center>No permissions</Center>
      )}
    </Modal>
  );
}
