import { Center, Modal } from "@mantine/core";
import { SelectUser as User } from "~/utils/types/db/users";
import { PermissionsTable } from "./PermissionsTable";

export function PermissionsModal({
  opened,
  close,
  row,
}: {
  opened: boolean;
  close: () => void;
  row: User | null;
}) {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`User Permissions - ${row?.email}`}
    >
      {row?.userPermissions?.length ? (
        <PermissionsTable permissions={row.userPermissions} />
      ) : (
        <Center>No permissions</Center>
      )}
    </Modal>
  );
}
