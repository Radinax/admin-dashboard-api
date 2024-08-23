import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "../db";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { users } from "../db/schema";
import type { CustomError } from "../types/error";
import { userSchema } from "../schema";
import { HttpStatusCode } from "../types/http-code.enum";

const router = new Hono();

/**
 * @api     GET /me
 * @desc    Retrieves current user data
 * @access  Private
 */
router.get("/me", async (c) => {
  const userId = getCookie(c, "session");

  if (!userId) {
    return c.body("User not found", HttpStatusCode.NotFound);
  }

  const existingUser = await db.query.users.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, userId);
    },
  });

  if (!existingUser) {
    return c.body("User already exists", HttpStatusCode.NotFound);
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
router.post("/signup", zValidator("json", userSchema), async (c) => {
  const { username, password, email } = c.req.valid("json");
  const hashedPassword = await Bun.password.hash(password, "argon2id");

  const existingEmail = await db.query.users.findFirst({
    where(fields, { eq }) {
      return eq(fields.email, email);
    },
  });

  if (existingEmail) {
    return c.body("Email is already on use", HttpStatusCode.NotFound);
  }

  try {
    await db
      .insert(users)
      .values({ username: username ?? email, password: hashedPassword, email });
    return c.body("User created successfully", HttpStatusCode.Created);
  } catch (err) {
    console.error(err);
    const error = err as CustomError;
    return c.body(error.message, HttpStatusCode.InternalServerError);
  }
});

/**
 * @api     POST /signin
 * @desc    Login user
 * @access  Public
 */
router.post("/signin", zValidator("json", userSchema), async (c) => {
  const { password, email } = c.req.valid("json");
  const existingUser = await db.query.users.findFirst({
    where(fields, { eq }) {
      return eq(fields.email, email);
    },
  });

  if (!existingUser) {
    return c.body("User input is not valid", HttpStatusCode.NotFound);
  }

  const passwordMatch = await Bun.password.verify(
    password,
    existingUser.password,
    "argon2id"
  );

  if (!passwordMatch) {
    return c.body("User input is not valid", HttpStatusCode.NotFound);
  }

  setCookie(c, "session", existingUser.id, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 86400,
  });

  return c.json(
    { username: existingUser.username, email, id: existingUser.id },
    HttpStatusCode.Created
  );
});

/**
 * @api     POST /logout
 * @desc    Logout user
 * @access  Public
 */
router.post("/signout", async (c) => {
  // Get the session cookie
  const sessionCookie = getCookie(c, "session");

  if (!sessionCookie) {
    return c.body("No session found", 404);
  }

  // Delete the session cookie
  deleteCookie(c, "session");

  // Return a success response
  return c.json({ message: "Logged out successfully" }, HttpStatusCode.OK);
});

export default router;
