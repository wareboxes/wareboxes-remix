import { ActionIcon, Center, Input, Modal, Space, Table } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useMemo } from "react";
import { useDataAction } from "~/utils/hooks/useDataAction";
import { SelectRole as Role } from "~/utils/types/db/users";
import { AddRoleForm } from "./AddRoleForm";
import { RoleActions } from "./Actions";

export function ChildRolesModal({
  opened,
  close,
  roles,
  row,
}: {
  opened: boolean;
  close: () => void;
  roles: Role[];
  row: Role | null;
}) {
  const deleter = useDataAction({
    dataAction: RoleActions.DeleteChildRole,
    notificationMessages: {
      successMessage: "Role deleted successfully",
    },
  });

  const filteredRoles = useMemo(
    () =>
      roles.filter((role) => {
        // If role already has child role or parent role, do not show in list
        if (
          role.id === row?.id ||
          role.description === "Self role" ||
          role.parentRoles?.length ||
          row?.childRoles?.some((r) => r.id === role.id) ||
          row?.parentRoles?.some((r) => r.id === role.id)
        ) {
          return false;
        }
        return true;
      }),
    [roles, row]
  );

  return (
    <Modal opened={opened} onClose={close} title={`Child Roles - ${row?.name}`}>
      {filteredRoles?.length > 0 && (
        <Center>
          <AddRoleForm row={row} filteredRoles={filteredRoles} />
          <Space h="md" />
        </Center>
      )}
      {row?.childRoles?.length ? (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Actions</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Description</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {row.childRoles.map((role) => (
              <Table.Tr key={role.id}>
                <Table.Td>
                  <deleter.Form method="POST">
                    <Input
                      type="hidden"
                      name="action"
                      value={RoleActions.DeleteChildRole}
                    />
                    <Input type="hidden" name="roleId" value={row.id} />
                    <Input type="hidden" name="childRoleId" value={role.id} />
                    {role.parentId === row.id && (
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
                <Table.Td>{role.name}</Table.Td>
                <Table.Td>{role.description}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Center>No child roles</Center>
      )}
    </Modal>
  );
}
