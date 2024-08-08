import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { products } from "../db/schema";
import { getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { allowedTypes } from "../types/product";

const router = new Hono();

const productSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .trim()
    .max(100, { message: "Name must not exceed 100 characters" }),
  type: z.enum(allowedTypes),
  price: z
    .number()
    .positive({ message: "Price must be a positive number" })
    .max(10000, { message: "Price must not exceed 10,000" }),
  description: z.string().optional(),
});

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
      .values({ id: userId, name, type, price, description })
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

export default router;
