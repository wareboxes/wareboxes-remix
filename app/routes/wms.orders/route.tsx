import { Button, Grid, Text, Tooltip } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import {
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableOptions,
} from "mantine-react-table";
import { useMemo } from "react";
import { LocaleTimeCell } from "~/components/Table/LocaleTimeCell";
import TableV1 from "~/components/Table/Table";
import { useDataAction } from "~/utils/hooks/useDataAction";
import { SelectOrder as Order } from "~/utils/types/db/orders";
import { OrderActions } from "./Actions";
import { action, loader } from "./route.server";
import { useDisclosure } from "@mantine/hooks";
import { NewOrderModal } from "./NewOrderModal";
import { IconClockExclamation } from "@tabler/icons-react";

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
  const [
    newOrderModalOpen,
    { open: openNewOrderModal, close: closeNewOrderModal },
  ] = useDisclosure();
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
        header: "Info",
        accessorKey: "idInfo",
        Cell: ({ cell }: { cell: MRT_Cell<Order> }) => {
          const rush = cell.row.original.rush;
          return (
            <Text>

              {rush ? (
                <Tooltip label="Rush Order">
                  <IconClockExclamation color="orange" />
                </Tooltip>
              ) : null}
            </Text>
          );
        },
        enableEditing: false,
        enableSorting: false,
        enableColumnActions: false,
      },
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
      <NewOrderModal opened={newOrderModalOpen} onClose={closeNewOrderModal} />
      {/* <OrderItemsModal
        opened={orderItemsModalOpen}
        onClose={close}
        orderId={selectedRow?.id}
      /> */}
      <Grid.Col span={12}>
        <Button onClick={openNewOrderModal} color="blue">
          New Order
        </Button>
      </Grid.Col>
      <Grid.Col span={12}>
        <TableV1
          data={orders}
          columns={columns}
          updateData={updateOrder}
          deleteDataAction="deleteOrder"
          restoreDataAction="restoreOrder"
          tableId="orderId"
          editModalTitle={(row) => `Edit Order - ${row.original.orderKey}`}
          deleteModalTitle={(row) => `Delete Order - ${row.original.orderKey}`}
          deleteConfirmComponent={(row) => (
            <Text>
              Are you sure you want to delete order {row.original.orderKey}?
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
