import { Modal } from "@mantine/core";
import { SelectRole as Role } from "~/utils/types/db/users";

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
  const filteredRoles = roles.filter((role) => {
    // If role already has child role, do not show in list
    if (
      row?.childRoles?.some((r) => r.id === role.id)
    ) {
      return false;
    }
    return true;
  });


  return <Modal
    opened={opened}
    onClose={close}
    title={`Child Roles - ${row?.name}`}
  >

  </Modal>;

}