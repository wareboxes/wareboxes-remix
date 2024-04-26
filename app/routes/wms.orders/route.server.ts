import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  NewOrderSchema,
  OrderUpdateSchema,
  RestoreDeleteOrderSchema,
  addOrder,
  deleteOrder,
  getOrders,
  updateOrder,
} from "~/utils/orders";
import { withAuth } from "~/utils/permissions";
import { actionHandler, actionResponse } from "~/utils/types/actions";
import { OrderActions } from "./Actions";

const orderActionHandlers = {
  [OrderActions.NewOrder]: handleNewOrder,
  [OrderActions.UpdateOrder]: handleUpdateOrder,
  [OrderActions.DeleteOrder]: handleDeleteOrder,
};

export async function loader({ request }: LoaderFunctionArgs) {
  await withAuth("orders", request);
  return { orders: await getOrders() };
}

export async function action({ request }: ActionFunctionArgs) {
  await withAuth("orders", request);

  return actionHandler(
    request,
    orderActionHandlers,
    actionResponse(false, "Invalid action")
  );
}

async function handleNewOrder(formData: FormData) {
  const result = NewOrderSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid order data", result.error.flatten())
    );
  }

  const res = await addOrder(result.data);

  return json(actionResponse(res));
}

async function handleUpdateOrder(formData: FormData) {
  const result = OrderUpdateSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid order data", result.error.flatten())
    );
  }

  const { orderId, ...orderData } = result.data;
  const res = await updateOrder(orderData, orderId);

  return json(actionResponse(res));
}

async function handleDeleteOrder(formData: FormData) {
  const result = RestoreDeleteOrderSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid order data", result.error.flatten())
    );
  }

  const res = await deleteOrder(result.data.orderId);
  return json(actionResponse(res));
}
