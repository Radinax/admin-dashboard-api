import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { getCookie, setCookie } from "hono/cookie";
import { users } from "../db/schema";
import type { CustomError } from "../types/error";

const router = new Hono();

const credentialsSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  email: z.string().email("Invalid email address"), // Validates email format

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character"),
});

/**
 * @api     GET /me
 * @desc    Retrieves current user data
 * @access  Private
 */
router.get("/me", async (c) => {
  const userId = getCookie(c, "session");

  if (!userId) {
    return c.body("User not found", 404);
  }

  const existingUser = await db.query.users.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, userId);
    },
  });

  if (!existingUser) {
    return c.body("User already exists", 404);
  }

  return c.json({
    username: existingUser.username,
    sessionId: existingUser.id,
    email: existingUser.email,
  });
});

/**
 * @api     POST /signup
 * @desc    Register user
 * @access  Public
 */
router.post("/signup", zValidator("json", credentialsSchema), async (c) => {
  const { username, password, email } = c.req.valid("json");
  const hashedPassword = await Bun.password.hash(password, "argon2id");

  const existingEmail = await db.query.users.findFirst({
    where(fields, { eq }) {
      return eq(fields.email, email);
    },
  });

  if (existingEmail) {
    return c.body("Email is already on use", 404);
  }

  try {
    await db
      .insert(users)
      .values({ username, password: hashedPassword, email });
    return c.body("User created successfully", 201);
  } catch (err) {
    console.error(err);
    const error = err as CustomError;
    return c.body(error.message, 500);
  }
});

/**
 * @api     POST /signin
 * @desc    Login user
 * @access  Public
 */
router.post("/signin", zValidator("json", credentialsSchema), async (c) => {
  const { username, password, email } = c.req.valid("json");
  const existingUser = await db.query.users.findFirst({
    where(fields, { eq }) {
      return eq(fields.email, email);
    },
  });

  if (!existingUser) {
    return c.body("User input is not valid", 404);
  }

  const passwordMatch = await Bun.password.verify(
    password,
    existingUser.password,
    "argon2id"
  );

  if (!passwordMatch) {
    return c.body("User input is not valid", 404);
  }

  setCookie(c, "session", existingUser.id, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 86400,
  });

  return c.json({ username, email, id: existingUser.id }, 204);
});

export default router;
