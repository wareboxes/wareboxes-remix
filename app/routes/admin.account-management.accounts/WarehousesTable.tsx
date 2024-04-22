import { Table } from "@mantine/core";
import { SelectWarehouse as Warehouse } from "~/utils/types/db/locations";

export function WarehousesTable({
  warehouses,
}: {
  warehouses: Warehouse[];
}) {
  return (
    <Table highlightOnHover withTableBorder className="text-center">
      <Table.Tbody>
        {warehouses.map((warehouse) => (
          <Table.Tr key={warehouse.id}>
            <Table.Td>{warehouse.name}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
