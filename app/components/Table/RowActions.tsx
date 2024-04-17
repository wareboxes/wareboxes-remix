/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionIcon, Flex, Input, Loader, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconRestore, IconTrash } from "@tabler/icons-react";
import { MRT_Row, MRT_TableInstance } from "mantine-react-table";
import { useDataAction } from "~/utils/hooks/useDataAction";

interface RowActionsProps<T extends Record<string, any>> {
  row: MRT_Row<T>;
  table: MRT_TableInstance<T>;
  tableId: string;
  actions: {
    delete: string;
    restore: string;
  };
  getDeleteConfirmMessage: (row: MRT_Row<T>) => React.ReactNode;
}

export function RowActions<T extends Record<string, any>>({
  row,
  table,
  tableId,
  actions,
  getDeleteConfirmMessage,
}: RowActionsProps<T>) {
  const deleter = useDataAction({
    dataAction: actions.delete,
    notificationMessages: {
      successMessage: "Item deleted successfully",
    },
  });
  const restorer = useDataAction({
    dataAction: actions.restore,
    notificationMessages: {
      successMessage: "Item restored successfully",
    },
  });

  const isDeleted = row.original.deleted;
  const isSelfRole = row.original.description === "Self role";

  const openDeleteConfirmModal = (formData: FormData) => {
    modals.openConfirmModal({
      title: "Confirm item deletion",
      children: getDeleteConfirmMessage(row),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleter.submit(formData),
    });
  };

  return (
    <Flex gap="md">
      <Tooltip label={isSelfRole ? "Cannot edit self role" : "Edit"}>
        <ActionIcon
          variant="outline"
          disabled={isSelfRole}
          onClick={() => table.setEditingRow(row)}
        >
          <IconEdit />
        </ActionIcon>
      </Tooltip>
      {isDeleted ? (
        <Tooltip label="Restore">
          <restorer.Form method="POST">
            <Input type="hidden" name="action" value={actions.restore} />
            <Input type="hidden" name={tableId} value={row.original.id} />
            <ActionIcon
              variant="outline"
              color="green"
              disabled={restorer.submitting}
              type="submit"
            >
              {restorer.submitting ? <Loader /> : <IconRestore />}
            </ActionIcon>
          </restorer.Form>
        </Tooltip>
      ) : (
        <Tooltip label={isSelfRole ? "Cannot delete self role" : "Delete"}>
          <deleter.Form
            method="POST"
            onSubmit={(e) => {
              e.preventDefault();
              openDeleteConfirmModal(new FormData(e.currentTarget));
            }}
          >
            <Input type="hidden" name="action" value={actions.delete} />
            <Input type="hidden" name={tableId} value={row.original.id} />
            <ActionIcon
              variant="outline"
              color="red"
              disabled={deleter.submitting || isSelfRole}
              type="submit"
            >
              {deleter.submitting ? <Loader /> : <IconTrash />}
            </ActionIcon>
          </deleter.Form>
        </Tooltip>
      )}
    </Flex>
  );
}
