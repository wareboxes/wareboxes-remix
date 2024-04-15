import {
  MRT_TableOptions,
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
} from "mantine-react-table";
import { EditModal } from "~/components/Table/EditModal";
import { RowActions } from "~/components/Table/RowActions";

interface TablePageProps<T extends Record<string, unknown>> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  updateData: MRT_TableOptions<T>["onEditingRowSave"];
  deleteData: (id: string) => Promise<void>;
  restoreData: (id: string) => Promise<void>;
  getDeleteConfirmMessage: (row: MRT_Row<T>) => React.ReactNode;
  title: string;
}

export default function TablePage<T extends Record<string, unknown>>({
  data,
  columns,
  updateData,
  deleteData,
  restoreData,
  getDeleteConfirmMessage,
  title,
}: TablePageProps<T>) {

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
    },
    positionGlobalFilter: "left",
    autoResetAll: false,
    enableEditing: true,
    onEditingRowSave: updateData,
    renderRowActions: ({ row, table }) => (
      <RowActions
        row={row}
        table={table}
        onDelete={(id) => deleteData(id)}
        onRestore={(id) => restoreData(id)}
        getDeleteConfirmMessage={getDeleteConfirmMessage}
      />
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <EditModal
        table={table}
        row={row}
        internalEditComponents={internalEditComponents}
        title={`Edit ${title}`}
      />
    ),
    mantineTableProps: {
      striped: true,
    },
  });

  return <MantineReactTable table={table} />;
}