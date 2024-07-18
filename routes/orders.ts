import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { z } from "zod";
import { db } from "../db";
import { OrderStatus, orders, type Order } from "../db/schema";
import { streamSSE } from "hono/streaming";
import pubsub from "../pubsub";

type Bus = {
  orderAdded: [order: Order];
};

const [pub, sub] = pubsub<Bus>();

const router = new Hono();

const orderSchema = z.object({
  id: z.string(),
  date: z.coerce.date(),
  stock: z.string(),
  type: z.string(),
  status: z.nativeEnum(OrderStatus),
  quantity: z.number(),
  price: z.number(),
});

const createOrderSchema = orderSchema.pick({
  stock: true,
  quantity: true,
  price: true,
});

router.get("/", async (c) => {
  const orders = await db.query.orders.findMany({});
  return c.json(orders);
});

router.get("/sse", async (c) => {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController | undefined;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
    cancel() {
      console.log("Request cancelled");
      unsubscribe?.();
    },
  });

  const unsubscribe = sub("orderAdded", (order) => {
    const data = encoder.encode(`data: ${JSON.stringify(order)}\n\n`);
    console.log("Writing data...");
    controller?.enqueue(data);
  });

  c.req.raw.signal.addEventListener(
    "abort",
    () => {
      unsubscribe?.();
      controller?.close();
    },
    { once: true },
  );

  return c.body(stream, {
    headers: [["content-type", "text/event-stream"]],
  });
});

router.post("/", zValidator("json", createOrderSchema), async (c) => {
  const userId = getCookie(c, "session");

  if (userId) {
    return c.body(null, 401);
  }

  try {
    const [order] = await db
      .insert(orders)
      .values({
        ...c.req.valid("json"),
        type: "buy",
        userId,
      })
      .returning();
    pub("orderAdded", order);
    return c.json(order, 201);
  } catch (err) {
    console.error(err);
    return c.body(null, 500);
  }
});

export default router;
