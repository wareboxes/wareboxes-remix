import {
  MRT_TableOptions,
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
} from "mantine-react-table";
import { EditModal } from "~/components/Table/EditModal";
import { RowActions } from "~/components/Table/RowActions";

interface TablePageProps<
  T extends Record<string, unknown>,
  Action extends string
> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  updateData: MRT_TableOptions<T>["onEditingRowSave"];
  deleteDataAction: Action;
  restoreDataAction: Action;
  tableId: string;
  editModalTitle?: string;
  deleteModalTitle?: (row: MRT_Row<T>) => string;
  columnVisibility?: Record<string, boolean>;
  deleteConfirmComponent: (row: MRT_Row<T>) => React.ReactNode;
  canEditRow?: (row: MRT_Row<T>) => { edit: boolean; reason?: string };
  canDeleteRow?: (row: MRT_Row<T>) => { delete: boolean; reason?: string };
}

export default function TableV1<
  T extends Record<string, unknown>,
  Action extends string
>({
  data,
  columns,
  updateData,
  deleteDataAction,
  restoreDataAction,
  tableId,
  editModalTitle = "Edit Item",
  deleteModalTitle = () => `Delete Item`,
  columnVisibility = {},
  deleteConfirmComponent,
  canEditRow,
  canDeleteRow,
}: TablePageProps<T, Action>) {
  const handleRowSave: MRT_TableOptions<T>["onEditingRowSave"] = (values) => {
    if (updateData) {
      updateData(values);
    }
    table.setEditingRow(null);
  };

  const table = useMantineReactTable({
    columns,
    data,
    initialState: {
      density: "xs",
      pagination: {
        pageIndex: 0,
        pageSize: 500,
      },
      showGlobalFilter: true,
      columnVisibility,
    },
    positionGlobalFilter: "left",
    autoResetAll: false,
    enableEditing: true,
    onEditingRowSave: handleRowSave,
    renderRowActions: ({ row, table }) => (
      <RowActions
        row={row}
        table={table}
        tableId={tableId}
        actions={{
          delete: deleteDataAction,
          restore: restoreDataAction,
        }}
        canEditRow={canEditRow}
        canDeleteRow={canDeleteRow}
        deleteModalTitle={deleteModalTitle(row)}
        deleteConfirmComponent={deleteConfirmComponent}
      />
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <EditModal
        table={table}
        row={row}
        internalEditComponents={internalEditComponents}
        title={`${editModalTitle}`}
      />
    ),
    mantineTableProps: {
      striped: true,
    },
  });

  return <MantineReactTable table={table} />;
}
