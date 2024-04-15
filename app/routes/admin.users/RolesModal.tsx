import {
  ActionIcon,
  Button,
  Center,
  ComboboxItem,
  Loader,
  Modal,
  Select,
  Space,
  Table,
  Text,
} from "@mantine/core";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { SelectRole as Role, SelectUser as User } from "~/utils/types/db/users";
import { action } from "./route.server";
export function RolesModal({
  roles,
  row,
  setSelectedRow,
  deleteUserRole,
}: {
  roles: Role[];
  row: User | null;
  setSelectedRow: (row: User | null) => void;
  deleteUserRole: (userId: string, roleId: string) => void;
}) {
  const { addUserRoleError: error } = useActionData<typeof action>() ?? {};
  const [selectedRole, setSelectedRole] = useState<ComboboxItem | null>(null);
  const { state: navState } = useNavigation();
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
          <Form action="/admin/users" method="POST">
            <input type="hidden" name="intent" value="addUserRole" />
            <input type="hidden" name="userId" value={row?.id} />
            {error && (
              <Center>
                <Text variant="error">{error}</Text>
              </Center>
            )}
            <Select
              allowDeselect={false}
              name="roleId"
              data={filteredRoles.map((role) => ({
                value: role.id.toString(),
                label: role.name,
              }))}
              value={selectedRole ? selectedRole.value : ""}
              onChange={(_value, option) => setSelectedRole(option)}
              placeholder="Select role"
              required
            />
            <Center>
              <Button mt="sm" type="submit" disabled={navState === "submitting"}>
                {navState === "submitting" ? <Loader /> : "Add role"}
              </Button>
            </Center>
          </Form>
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
                  <ActionIcon
                    variant="outline"
                    color="red"
                    onClick={() =>
                      deleteUserRole(row.id.toString(), role.id.toString())
                    }
                  >
                    <IconTrash />
                  </ActionIcon>
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
