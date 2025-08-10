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
    where: (fields, { eq }) => eq(fields.email, email),
  });

  if (existingEmail) {
    return c.json(
      { error: "An account with this email already exists." },
      HttpStatusCode.Conflict
    );
  }

  try {
    const [newUser] = await db
      .insert(users)
      .values({
        username: username ?? email,
        email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
      });

    // Set session cookie (for "login after signup")
    setCookie(c, "session", newUser.id, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400,
      sameSite: "lax",
    });

    // 5. Return minimal user info + success
    return c.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      },
      HttpStatusCode.Created // 201 Created is correct for creation
    );
  } catch (err) {
    console.error("Signup error:", err);

    // Handle known DB errors (e.g., unique constraint on username)
    if (err instanceof Error) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return c.json(
          { error: "Username is already taken." },
          HttpStatusCode.Conflict
        );
      }
      // Generic fallback
      return c.json(
        { error: "Failed to create account. Please try again later." },
        HttpStatusCode.InternalServerError
      );
    }

    return c.json(
      { error: "An unexpected error occurred." },
      HttpStatusCode.InternalServerError
    );
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
    where: (fields, { eq }) => eq(fields.email, email),
    columns: {
      id: true,
      username: true,
      email: true,
      password: true,
    },
  });

  if (!existingUser) {
    // Simulate work to prevent timing leaks
    await Bun.password.hash("fake", "argon2id"); // dummy hash
    return c.body("Invalid credentials", HttpStatusCode.Unauthorized);
  }

  const passwordMatch = await Bun.password.verify(
    password,
    existingUser.password,
    "argon2id"
  );

  if (!passwordMatch) {
    return c.body("Invalid credentials", HttpStatusCode.Unauthorized);
  }

  setCookie(c, "session", existingUser.id, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 86400, //24 hours
    sameSite: "lax", // prevent CSRF
  });

  return c.json(
    { username: existingUser.username, email, id: existingUser.id },
    HttpStatusCode.OK
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
