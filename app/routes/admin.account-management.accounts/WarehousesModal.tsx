import { Center, Modal } from "@mantine/core";
import { SelectWarehouse as Warehouse } from "~/utils/types/db/locations";
import { SelectAccount as Account } from "~/utils/types/db/accounts";
import { WarehousesTable } from "./WarehousesTable";

export function WarehousesModal({
  opened,
  close,
  row
}: {
  opened: boolean;
  close: () => void;
  warehouses: Warehouse[];
  row: Account | null;
}) {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`Account Warehouses - ${row?.name}`}
    >
      {row?.accountWarehouses?.length ? (
        <WarehousesTable warehouses={row.accountWarehouses} />
      ) : (
        <Center>No warehouses</Center>
      )}
    </Modal>
  );
}