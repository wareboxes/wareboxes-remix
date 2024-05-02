import { Modal } from "@mantine/core";
import { OrderForm } from "~/components/OrderForm";
import { OrderActions } from "./Actions";

export function NewOrderModal({
  opened,
  close,
}: {
  opened: boolean;
  close: () => void;
}) {
  return (
    <Modal opened={opened} onClose={close} title="Create New Order">
      <OrderForm action={OrderActions.NewOrder} onSubmit={close} />
    </Modal>
  );
}
