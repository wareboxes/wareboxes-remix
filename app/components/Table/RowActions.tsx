/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionIcon, Flex, Input, Loader, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconRestore, IconTrash } from "@tabler/icons-react";
import { MRT_Row, MRT_TableInstance } from "mantine-react-table";
import { useDataAction } from "~/utils/hooks/useDataAction";

interface RowActionsProps<T extends Record<string, any>, K> {
  row: MRT_Row<T>;
  table: MRT_TableInstance<T>;
  tableId: string;
  actions: {
    delete: K;
    restore: K;
  };
  deleteModalTitle?: string;
  deleteConfirmComponent: (row: MRT_Row<T>) => React.ReactNode;
  canEditRow?: (row: MRT_Row<T>) => { edit: boolean; reason?: string };
  canDeleteRow?: (row: MRT_Row<T>) => { delete: boolean; reason?: string };
}

export function RowActions<T extends Record<string, any>>({
  row,
  table,
  tableId,
  actions,
  deleteModalTitle: deleteConfirmTitle = "Delete Item",
  deleteConfirmComponent,
  canEditRow = () => {
    return { edit: true, reason: "Cannot edit row" };
  },
  canDeleteRow = () => {
    return { delete: true, reason: "Cannot delete row" };
  }
}: RowActionsProps<T, string>) {
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
  const canEdit = canEditRow(row);
  const canDelete = canDeleteRow(row);

  const openDeleteConfirmModal = (formData: FormData) => {
    modals.openConfirmModal({
      title: deleteConfirmTitle,
      children: deleteConfirmComponent(row),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleter.submit(formData),
    });
  };

  return (
    <Flex gap="md">
      <Tooltip label={canEdit.edit ? "Edit" : canEdit.reason}>
        <ActionIcon
          variant="outline"
          disabled={!canEdit.edit}
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
        <Tooltip label={canDelete.delete ? "Delete" : canDelete.reason}>
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
              disabled={deleter.submitting || !canDelete.delete}
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
