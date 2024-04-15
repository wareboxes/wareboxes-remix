/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionIcon, Flex, Loader, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconRestore, IconTrash } from "@tabler/icons-react";
import { MRT_Row, MRT_TableInstance } from "mantine-react-table";
import { useDataAction } from "~/utils/hooks/useDataAction";

interface RowActionsProps<T extends Record<string, any>> {
  row: MRT_Row<T>;
  table: MRT_TableInstance<T>;
  onDelete: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  getDeleteConfirmMessage: (row: MRT_Row<T>) => React.ReactNode;
}

export function RowActions<T extends Record<string, any>>({
  row,
  table,
  onDelete,
  onRestore,
  getDeleteConfirmMessage,
}: RowActionsProps<T>) {
  const deleter = useDataAction({
    action: "delete",
    notificationMessages: {
      successMessage: "Item deleted successfully",
    },
  });
  const restorer = useDataAction({
    action: "restore",
    notificationMessages: {
      successMessage: "Item restored successfully",
    },
  });

  const deleted = row.original.deleted;

  const openDeleteConfirmModal = (row: MRT_Row<T>) =>
    modals.openConfirmModal({
      title: "Are you sure you want to delete this item?",
      children: getDeleteConfirmMessage(row),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => onDelete(row.original.id.toString()),
    });

  return (
    <Flex gap="md">
      <Tooltip label="Edit">
        <ActionIcon variant="outline" onClick={() => table.setEditingRow(row)}>
          <IconEdit />
        </ActionIcon>
      </Tooltip>

      {deleted ? (
        <Tooltip label="Restore">
          <ActionIcon
            variant="outline"
            color="green"
            onClick={() => onRestore(row.original.id.toString())}
            disabled={restorer.loading}
          >
            {restorer.loading ? <Loader /> : <IconRestore />}
          </ActionIcon>
        </Tooltip>
      ) : (
        <Tooltip label="Delete">
          <ActionIcon
            variant="outline"
            color="red"
            onClick={() => openDeleteConfirmModal(row)}
            disabled={deleter.loading}
          >
            {deleter.loading ? <Loader /> : <IconTrash />}
          </ActionIcon>
        </Tooltip>
      )}
    </Flex>
  );
}
