import { ActionIcon, Center, Input, Modal, Space, Table } from "@mantine/core";
import { useNavigation } from "@remix-run/react";
import { IconTrash } from "@tabler/icons-react";
import { useMemo } from "react";
import { useDataAction } from "~/utils/hooks/useDataAction";
import { SelectRole as Role, SelectUser as User } from "~/utils/types/db/users";
import { AddRoleForm } from "./AddRoleForm";
import { UserActions } from "./Actions";

export function RolesModal({
  opened,
  close,
  roles,
  row,
}: {
  opened: boolean;
  close: () => void;
  roles: Role[];
  row: User | null;
}) {
  const { state: navState } = useNavigation();
  const deleter = useDataAction({
    dataAction: UserActions.DeleteUserRole,
    notificationMessages: {
      successMessage: "User role deleted successfully",
    },
  });

  const filteredRoles = useMemo(
    () =>
      roles.filter((role) => {
        // If self role or user already has role, do not show in list
        if (
          role.description === "Self role" ||
          row?.userRoles?.some((r) => r.id === role.id)
        ) {
          return false;
        }
        return true;
      }),
    [roles, row]
  );

  return (
    <Modal opened={opened} onClose={close} title={`Roles - ${row?.email}`}>
      {filteredRoles?.length > 0 && (
        <Center>
          <AddRoleForm
            navState={navState}
            row={row}
            filteredRoles={filteredRoles}
          />
          <Space h="md" />
        </Center>
      )}
      {row?.userRoles?.length ? (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Actions</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Description</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {row.userRoles.map((role) => (
              <Table.Tr key={role.id}>
                <Table.Td>
                  {(role.description !== "Self role" ||
                    role.name !== row.email) && (
                    <deleter.Form method="POST">
                      <Input
                        type="hidden"
                        name="action"
                        value={UserActions.DeleteUserRole}
                      />
                      <Input type="hidden" name="userId" value={row.id} />
                      <Input type="hidden" name="roleId" value={role.id} />
                      <ActionIcon
                        variant="outline"
                        color="red"
                        disabled={deleter.loading}
                        type="submit"
                      >
                        <IconTrash />
                      </ActionIcon>
                    </deleter.Form>
                  )}
                </Table.Td>
                <Table.Td>{role.name}</Table.Td>
                <Table.Td>{role.description}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Center>No roles assigned</Center>
      )}
    </Modal>
  );
}
