import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "../db";
import { products } from "../db/schema";
import { getCookie } from "hono/cookie";
import { avg, count, eq, max, min, sql } from "drizzle-orm";
import { productSchema } from "../schema";

type summary = {
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
  productTypes: number;
}[];

const router = new Hono();

/**
 * @api     POST /products/create
 * @desc    Create product
 * @access  Private
 */
router.post("/create", zValidator("json", productSchema), async (c) => {
  const userId = getCookie(c, "session");

  // Destructure the validated request body
  const { name, type, price, description } = c.req.valid("json");

  try {
    // Validate userId
    if (!userId) {
      return c.text("User not authenticated", 401);
    }

    // Insert product into the database
    const [product] = await db
      .insert(products)
      .values({ name, type, price, description })
      .returning();

    return c.json(product, 201);
  } catch (err) {
    // Log the error for debugging
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
    // Validate userId
    if (!userId) {
      return c.text("User not authenticated", 401);
    }

    // Fetch all products from the database
    const products = await db.query.products.findMany();

    // Return the list of products with a 200 status
    return c.json(products, 200);
  } catch (err) {
    // Log the error for debugging
    console.error("Error creating product:", err);
    return c.text("Error creating product", 500);
  }
});

/**
 * @api     GET /products/summary
 * @desc    Get product summary (average price, highest price, lowest price, product types)
 * @access  Private
 */
router.get("/summary", async (c) => {
  const userId = getCookie(c, "session");

  try {
    // Validate userId
    if (!userId) {
      return c.text("User not authenticated", 401);
    }

    // Perform the aggregation query using Drizzle's built-in functions
    const summary = await db
      .select({
        averagePrice: avg(products.price).mapWith(Number), // Use Drizzle's `avg` function
        highestPrice: max(products.price).mapWith(Number), // Use Drizzle's `max` function
        lowestPrice: min(products.price).mapWith(Number), // Use Drizzle's `min` function
        productTypes: count(products.type).mapWith(Number), // Use Drizzle's `count` function
      })
      .from(products);

    console.log("Summary:", summary);

    // Return the summary data
    return c.json(summary[0], 200);
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
  const productId = c.req.param("id"); // Retrieve the product ID from the URL parameters

  try {
    // Validate userId
    if (!userId) {
      return c.text("User not authenticated", 401);
    }
    if (!productId) {
      return c.text("Invalid product ID format", 400);
    }

    // Fetch all products from the database
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    // Return the product by ID with a 200 status
    return c.json(product, 200);
  } catch (err) {
    // Log the error for debugging
    console.error("Error fetching product:", err);
    return c.text("Error fetching product", 500);
  }
});

/**
 * @api     DELETE /products/:id
 * @desc    DELETE product by id
 * @access  Private
 */
router.delete("/:id", async (c) => {
  const userId = getCookie(c, "session");
  const productId = c.req.param("id"); // Retrieve the product ID from the URL parameters

  try {
    // Validate userId
    if (!userId) {
      return c.text("User not authenticated", 401);
    }
    if (!productId) {
      return c.text("Invalid product ID format", 400);
    }

    // Delete product from the database
    await db.delete(products).where(eq(products.id, productId));

    // Return status 204
    return new Response(null, { status: 204 });
  } catch (err) {
    // Log the error for debugging
    console.error("Error fetching product:", err);
    return c.text("Error deleting product", 500);
  }
});

export default router;
