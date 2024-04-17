import { and, eq, getTableColumns, inArray, isNull, sql, desc } from "drizzle-orm";
import { db } from "./db";
import { InsertOrder, SelectOrder as Order, SelectOrderItem as OrderItem, orderItems, orderStatus, orders } from "./types/db/orders";
import { z } from "zod";

export const addOrder = async (orderData: InsertOrder): Promise<boolean> => {
  const res = await db
    .insert(orders)
    .values(orderData)
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
  const query = db.update(orders).set(orderData).$dynamic();

  if (orderId) {
    query.where(eq(orders.id, orderId));
  } else if (orderKey) {
    query.where(eq(orders.orderKey, orderKey));
  }

  query.where(inArray(orders.status, ["held", "open", "processing"]));
  query.where(isNull(orders.closed));
  const res = await query.returning({ id: orders.id });
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

export const getOrder = async (
  orderId?: number,
  orderKey?: string
): Promise<Order | null> => {
  if (!orderId && !orderKey) {
    throw new Error("Either orderId or orderKey is required to get an order");
  }
  const query = db.select({
    ...getTableColumns(orders),
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
  }).from(orders)
  .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
  .$dynamic();

  if (orderId) {
    query.where(eq(orders.id, orderId));
  } else if (orderKey) {
    query.where(eq(orders.orderKey, orderKey));
  }

  const res = await query
  return res[0] || null;
};

export const getOrders = async (): Promise<Order[]> => {
  const res = await db
    .select({
      ...getTableColumns(orders),
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
    .where(isNull(orders.deleted))
    .groupBy(orders.id)
    .orderBy(desc(orders.created))
  return res;
};

export const OrderUpdateSchema = z
  .object({
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
  })
