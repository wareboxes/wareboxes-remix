import { Modal } from "@mantine/core";
import { OrderForm } from "~/components/OrderForm";
import { OrderActions } from "./Actions";

export function NewOrderModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {

  return (
    <Modal opened={opened} onClose={onClose} title="Create New Order">
      <OrderForm action={OrderActions.NewOrder} onSubmit={onClose} />
    </Modal>
  );
}