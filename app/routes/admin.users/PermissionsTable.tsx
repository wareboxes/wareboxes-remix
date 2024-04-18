import { Table } from "@mantine/core";
import { SelectPermission as Permission } from "~/utils/types/db/users";

export function PermissionsTable({
  permissions,
}: {
  permissions: Permission[];
}) {
  return (
    <Table highlightOnHover withTableBorder className="text-center">
      <Table.Tbody>
        {permissions.map((permission) => (
          <Table.Tr key={permission.id}>
            <Table.Td>{permission.name}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
