import { ActionIcon, Center, Modal, Space, Table } from "@mantine/core";
import { useActionData, useNavigation } from "@remix-run/react";
import { IconTrash } from "@tabler/icons-react";
import { SelectRole as Role, SelectUser as User } from "~/utils/types/db/users";
import { AddRoleForm } from "./AddRoleForm";
import { ActionResponse } from "~/utils/types/actions";
import { useCallback } from "react";
import { useDataAction } from "~/utils/hooks/useDataAction";

export function RolesModal({
  roles,
  row,
  setSelectedRow,
}: {
  roles: Role[];
  row: User | null;
  setSelectedRow: (row: User | null) => void;
}) {
  const actionData = useActionData<ActionResponse>();
  const { state: navState } = useNavigation();

  const userRoleDeleter = useDataAction({
    action: "deleteUserRole",
    notificationMessages: {
      successMessage: "User role deleted successfully",
    },
  });

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

  const filteredRoles = roles.filter((role) => {
    // If self role or user already has role, do not show in list
    if (
      role.description === "Self role" ||
      row?.userRoles?.some((r) => r.id === role.id)
    ) {
      return false;
    }
    return true;
  });

  return (
    <Modal
      opened={!!row}
      onClose={() => setSelectedRow(null)}
      title={`Roles - ${row?.email}`}
    >
      {filteredRoles?.length > 0 && (
        <Center>
          <AddRoleForm
            actionData={actionData}
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
                    <ActionIcon
                      variant="outline"
                      color="red"
                      onClick={() =>
                        deleteUserRole(row.id.toString(), role.id.toString())
                      }
                      disabled={userRoleDeleter.loading}
                    >
                      <IconTrash />
                    </ActionIcon>
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
