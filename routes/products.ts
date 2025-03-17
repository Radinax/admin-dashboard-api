import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "../db";
import { products } from "../db/schema";
import { getCookie } from "hono/cookie";
import { avg, count, eq, max, min, sql } from "drizzle-orm";
import { productSchema } from "../schema";
import type { ProductCategory, ProductType } from "../types/product";

const router = new Hono();

/**
 * @api     POST /products/create
 * @desc    Create product
 * @access  Private
 */
router.post("/create", zValidator("json", productSchema), async (c) => {
  const userId = getCookie(c, "session");

  // Destructure the validated request body
  const { name, type, price, description, category, stock } =
    c.req.valid("json");

  try {
    // Validate userId
    if (!userId) {
      return c.text("User not authenticated", 401);
    }

    // Insert product into the database
    const [product] = await db
      .insert(products)
      .values({
        name,
        type: type as ProductType,
        price,
        description,
        category: category as ProductCategory,
        stock,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return c.json(product, 201);
  } catch (err) {
    console.error("Error creating product:", err);
    return c.text("Error creating product", 500);
  }
});

/**
 * @api     GET /products
 * @desc    Get all products
 * @access  Private
 */
router.get("/", async (c) => {
  const userId = getCookie(c, "session");

  try {
    if (!userId) {
      return c.text("User not authenticated", 401);
    }

    const products = await db.query.products.findMany();
    return c.json(products, 200);
  } catch (err) {
    console.error("Error fetching products:", err);
    return c.text("Error fetching products", 500);
  }
});

/**
 * @api     GET /products/summary
 * @desc    Get product summary
 * @access  Private
 */
router.get("/summary", async (c) => {
  const userId = getCookie(c, "session");

  try {
    if (!userId) {
      return c.text("User not authenticated", 401);
    }

    // Get general product statistics
    const [productStats] = await db
      .select({
        averagePrice: avg(products.price).mapWith(Number),
        highestPrice: max(products.price).mapWith(Number),
        lowestPrice: min(products.price).mapWith(Number),
        totalProducts: count().mapWith(Number),
      })
      .from(products);

    // Get count of products with low stock (<=10)
    const [lowStockStats] = await db
      .select({
        lowStockProducts: count().mapWith(Number),
      })
      .from(products)
      .where(sql`${products.stock} <= 10`);

    return c.json(
      {
        ...productStats,
        lowStockProducts: lowStockStats.lowStockProducts,
      },
      200
    );
  } catch (err) {
    console.error("Error fetching product summary:", err);
    return c.text("Error fetching product summary", 500);
  }
});

/**
 * @api     GET /products/:id
 * @desc    Get product by id
 * @access  Private
 */
router.get("/:id", async (c) => {
  const userId = getCookie(c, "session");
  const productId = c.req.param("id");

  try {
    if (!userId) {
      return c.text("User not authenticated", 401);
    }
    if (!productId) {
      return c.text("Invalid product ID format", 400);
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      return c.text("Product not found", 404);
    }

    return c.json(product, 200);
  } catch (err) {
    console.error("Error fetching product:", err);
    return c.text("Error fetching product", 500);
  }
});

/**
 * @api     PUT /products/:id
 * @desc    Update product by id
 * @access  Private
 */
router.put("/:id", zValidator("json", productSchema), async (c) => {
  const userId = getCookie(c, "session");
  const productId = c.req.param("id");
  const { name, type, price, description, category, stock } =
    c.req.valid("json");

  try {
    if (!userId) {
      return c.text("User not authenticated", 401);
    }
    if (!productId) {
      return c.text("Invalid product ID format", 400);
    }

    const [updated] = await db
      .update(products)
      .set({
        name,
        type: type as ProductType,
        price,
        description,
        category: category as ProductCategory,
        stock,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();

    if (!updated) {
      return c.text("Product not found", 404);
    }

    return c.json(updated, 200);
  } catch (err) {
    console.error("Error updating product:", err);
    return c.text("Error updating product", 500);
  }
});

/**
 * @api     DELETE /products/:id
 * @desc    DELETE product by id
 * @access  Private
 */
router.delete("/:id", async (c) => {
  const userId = getCookie(c, "session");
  const productId = c.req.param("id");

  try {
    if (!userId) {
      return c.text("User not authenticated", 401);
    }
    if (!productId) {
      return c.text("Invalid product ID format", 400);
    }

    await db.delete(products).where(eq(products.id, productId));
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Error deleting product:", err);
    return c.text("Error deleting product", 500);
  }
});

export default router;
