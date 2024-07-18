import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";
import { getCookie, setCookie } from "hono/cookie";

const router = new Hono();

const credentialsSchema = z.object({
  username: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(255),
});

router.get("/me", async (c) => {
  const userId = getCookie(c, "session");

  if (!userId) {
    return c.body(null, 404);
  }

  const existingUser = await db.query.users.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, userId);
    },
  });

  if (!existingUser) {
    return c.body(null, 404);
  }

  return c.json({ username: existingUser.username });
});

router.post("/signup", zValidator("json", credentialsSchema), async (c) => {
  const { username, password } = c.req.valid("json");
  const hashedPassword = await Bun.password.hash(password, "argon2id");

  try {
    await db.insert(users).values({ username, password: hashedPassword });
    return c.body(null, 201);
  } catch (err) {
    console.error(err);
    return c.body(null, 500);
  }
});

router.post("/signin", zValidator("json", credentialsSchema), async (c) => {
  const { username, password } = c.req.valid("json");
  const existingUser = await db.query.users.findFirst({
    where(fields, { eq }) {
      return eq(fields.username, username);
    },
  });

  if (!existingUser) {
    return c.body(null, 404);
  }

  const passwordMatch = await Bun.password.verify(
    password,
    existingUser.password,
    "argon2id",
  );

  if (!passwordMatch) {
    return c.body(null, 404);
  }

  setCookie(c, "session", existingUser.id, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 86400,
  });

  return c.body(null, 204);
});

export default router;
