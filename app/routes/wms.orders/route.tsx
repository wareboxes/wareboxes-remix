import { Grid, Text } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import { MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_TableOptions } from "mantine-react-table";
import { useMemo } from "react";
import { LocaleTimeCell } from "~/components/Table/LocaleTimeCell";
import TableV1 from "~/components/Table/Table";
import { useDataAction } from "~/utils/hooks/useDataAction";
import { SelectOrder as Order } from "~/utils/types/db/orders";
import { OrderActions } from "./Actions";
import { action, loader } from "./route.server";

const orderStatusMap = {
  "awaiting shipment": "Awaiting Shipment",
  shipped: "Shipped",
  cancelled: "Cancelled",
  held: "Held",
  processing: "Processing",
  open: "Open",
};

export { action, loader };

export default function WmsOrders() {
  // const [orderItemsModalOpen, { open, close }] = useDisclosure();
  // const [selectedRow, setSelectedRow] = useState<Pick<Order, "id"> | null>(
  //   null
  // );
  const { orders } = useLoaderData<{ orders: Order[] }>() || { orders: [] };
  const updater = useDataAction({
    dataAction: OrderActions.UpdateOrder,
    notificationMessages: {
      successMessage: "Order updated successfully",
    },
  });

  const updateOrder: MRT_TableOptions<Order>["onEditingRowSave"] = async ({
    values,
  }) => {
    const formData = new FormData();
    formData.append("orderId", values.id);
    Object.entries(values).forEach(([key, value]) => {
      if (value != null) formData.append(key, value.toString());
    });
    updater.submit(formData);
  };

  // const openOrderModal = useCallback(
  //   (row: MRT_Row<Order>) => {
  //     open();
  //     setSelectedRow({ id: row.original.id });
  //   },
  //   [setSelectedRow, open]
  // );

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        header: "Order ID",
        accessorKey: "id",
        enableEditing: false,
      },
      {
        header: "Order Key",
        accessorKey: "orderKey",
      },
      {
        header: "Order Status",
        accessorKey: "status",
        Cell: ({ cell }: { cell: MRT_Cell<Order> }) => {
          const val = orderStatusMap[cell.getValue() as Order["status"]];
          return <Text>{val}</Text>;
        },
        editVariant: "select",
        mantineEditSelectProps: {
          data: Object.entries(orderStatusMap).map(([value, label]) => ({
            value,
            label,
          })),
        },
      },
      {
        header: "Created",
        accessorKey: "created",
        Cell: ({ cell }: { cell: MRT_Cell<Order> }) => {
          const created = cell.getValue() as string;
          return <LocaleTimeCell value={created} />;
        },
        Edit: () => null,
        enableEditing: false,
      },
    ],
    []
  );

  return (
    <Grid mt="xs">
      {/* <OrderItemsModal
        opened={orderItemsModalOpen}
        onClose={close}
        orderId={selectedRow?.id}
      /> */}
      <Grid.Col span={12}>
        <TableV1
          data={orders}
          columns={columns}
          updateData={updateOrder}
          deleteDataAction="deleteOrder"
          restoreDataAction="restoreOrder"
          tableId="orderId"
          editModalTitle="Edit Order"
          deleteModalTitle={(row) => `Delete Order with ID: ${row.original.id}`}
          deleteConfirmComponent={(row) => (
            <Text>
              Are you sure you want to delete Order with ID: {row.original.id}?
            </Text>
          )}
          canDeleteRow={(row: MRT_Row<Order>) => ({
            delete: ["open"].includes(row.original.status),
            reason: "Can only delete open orders",

          })}
          canEditRow={(row: MRT_Row<Order>) => ({
            edit: ["open", "held"].includes(row.original.status),
            reason: "Can only edit open or held orders",
          })}
        />
      </Grid.Col>
    </Grid>
  );
}
