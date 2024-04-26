import {
  and,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNull,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { InsertAddress, addresses } from "./types/db/base";
import {
  InsertOrder,
  SelectOrderItem as OrderItem,
  orderItems,
  orderStatus,
  orders,
} from "./types/db/orders";

export const addOrder = async (
  orderData: Omit<InsertOrder, "addressId">
): Promise<boolean> => {
  const addressId = await db
    .insert(addresses)
    .values(orderData as InsertAddress)
    .returning({ id: addresses.id });

  const res = await db
    .insert(orders)
    .values({ ...orderData, addressId: addressId[0].id })
    .returning({ id: orders.id });
  return !!res;
};

export const updateOrder = async (
  orderData: Partial<InsertOrder>,
  orderId?: number,
  orderKey?: string
): Promise<boolean> => {
  if (!orderId && !orderKey) {
    throw new Error(
      "Either orderId or orderKey is required to update an order"
    );
  }
  if (
    orderData.line1 ||
    orderData.line2 ||
    orderData.city ||
    orderData.state ||
    orderData.postalCode ||
    orderData.country
  ) {
    const addressId = await db
      .insert(addresses)
      .values(orderData as InsertAddress)
      .returning({ id: addresses.id });
    orderData.addressId = addressId[0].id;
  }
  const ordersQuery = db.update(orders).set(orderData).$dynamic();

  const conditions = [
    isNull(orders.deleted),
    inArray(orders.status, ["cancelled", "held", "open"]),
  ];

  if (orderId) {
    conditions.push(eq(orders.id, orderId));
  } else if (orderKey) {
    conditions.push(eq(orders.orderKey, orderKey));
  }
  ordersQuery.where(and(...conditions));

  const res = await ordersQuery.returning({ id: orders.id });
  return !!res;
};

export const deleteOrder = async (orderId: number): Promise<boolean> => {
  const res = await db
    .update(orders)
    .set({ deleted: new Date().toISOString() })
    .where(
      and(
        eq(orders.id, orderId),
        inArray(orders.status, ["cancelled", "held", "open"]),
        isNull(orders.closed)
      )
    )
    .returning({ id: orders.id });
  return !!res;
};

export const getOrder = async (orderId?: number, orderKey?: string) => {
  if (!orderId && !orderKey) {
    throw new Error("Either orderId or orderKey is required to get an order");
  }
  const query = db
    .select({
      ...getTableColumns(orders),
      line1: addresses.line1,
      line2: addresses.line2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      country: addresses.country,
      orderItems: sql<OrderItem[]>`
      COALESCE(
        json_agg(
          json_build_object(
            'id', ${orderItems.id},
            'created', ${orderItems.created},
            'deleted', ${orderItems.deleted},
            'qty', ${orderItems.qty},
            'itemId', ${orderItems.itemId},
            'itemBatchId', ${orderItems.itemBatchId}
          )
        ) FILTER (WHERE ${orderItems.id} IS NOT NULL),
        '[]'
      )::jsonb
    `,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
    .$dynamic();

  if (orderId) {
    query.where(eq(orders.id, orderId));
  } else if (orderKey) {
    query.where(eq(orders.orderKey, orderKey));
  }
  query.groupBy(orders.id, addresses.id);

  const res = await query;
  return res[0] || null;
};

export const getOrders = async () => {
  const res = await db
    .select({
      ...getTableColumns(orders),
      line1: addresses.line1,
      line2: addresses.line2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      country: addresses.country,
      orderItems: sql<OrderItem[]>`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ${orderItems.id},
              'created', ${orderItems.created},
              'deleted', ${orderItems.deleted},
              'qty', ${orderItems.qty},
              'itemId', ${orderItems.itemId},
              'itemBatchId', ${orderItems.itemBatchId}
            )
          ) FILTER (WHERE ${orderItems.id} IS NOT NULL),
          '[]'
        )::jsonb
      `,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
    .where(isNull(orders.deleted))
    .groupBy(orders.id, addresses.id)
    .orderBy(desc(orders.created));
  return res;
};

export const NewOrderSchema = z.object({
  orderKey: z.string(),
  rush: z.boolean({ coerce: true }).optional(),
  // shipBy: z.string().datetime().optional().transform((v) => v || undefined),
  line1: z.string(),
  line2: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

export const OrderUpdateSchema = z.object({
  orderId: z.number({ coerce: true }).positive(),
  orderKey: z.string().optional(),
  status: z.enum(orderStatus.enumValues).optional(),
  rush: z.boolean().optional(),
  addressId: z.number({ coerce: true }).positive().optional(),
  confirmed: z.string().datetime().optional(),
  closed: z.string().datetime().optional(),
  shipBy: z.string().datetime().optional(),
  waveId: z.number({ coerce: true }).positive().optional(),
  accountId: z.number({ coerce: true }).positive().optional(),
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const RestoreDeleteOrderSchema = z.object({
  orderId: z.number({ coerce: true }).positive(),
});
