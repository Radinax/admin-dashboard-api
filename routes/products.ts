import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { products } from "../db/schema";
import { getCookie } from "hono/cookie";

const router = new Hono();

const productSchema = z.object({
  // id: z.string().uuid(),
  name: z.string().min(1).trim(),
  type: z.string().min(1).trim(),
  price: z.number().positive({ message: "Price must be positive" }),
  description: z.string().optional(),
});

router.post("/product/create", zValidator("json", productSchema), async (c) => {
  const userId = getCookie(c, "session");
  const { name, type, price, description } = c.req.valid("json");
  console.log("name", name);

  try {
    const [product] = await db
      .insert(products)
      .values({ id: userId, name, type, price, description })
      .returning();
    return c.json(product, 201);
  } catch (err) {
    console.error(err);
    return c.text("Error creating product", 500);
  }
});

export default router;
