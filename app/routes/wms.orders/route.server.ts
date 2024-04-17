import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { OrderUpdateSchema, getOrders, updateOrder } from "~/utils/orders";
import { withAuth } from "~/utils/permissions";
import { actionResponse } from "~/utils/types/actions";
import { OrderActions } from "./Actions";

export async function loader({ request }: LoaderFunctionArgs) {
  await withAuth("orders", request);
  return { orders: await getOrders() };
}

export async function action({ request }: ActionFunctionArgs) {
  await withAuth("orders", request);
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case OrderActions.UpdateOrder:
      return handleUpdateOrder(formData);
    default:
      return json(actionResponse(false, "Invalid action"));
  }
}

async function handleUpdateOrder(formData: FormData) {
  const result = OrderUpdateSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid order data", result.error.flatten())
    )
  }

  const { orderId, ...orderData } = result.data;
  const res = await updateOrder(orderData, orderId);

  return json(actionResponse(res));
}



