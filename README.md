# api-bun-hono

Personal backend stack for private SAAS projects as a showcase for new members.

## Introduction

Uses a stack of Bun, Hono, SQlite, DrizzleORM.

This API contains a dashboard logic to be consumed in the [Frontend](https://github.com/Radinax/admin-dashboard-web), this stack makes it very easy to create a backend system for small to medium apps.

It contains authentications like login, logout and register, plus adding/removing/editing/reading a set of products inside a warehouse.

## Install

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run server
```

To run initial migrations:

```bash
bun drizzle-migration
```

To run drizzle studio:

```bash
bun drizzle-studio
```

These last two are scripts inside package json.

## Loop

Create DB Schema in `@db/schema.ts`:

```javascript
export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  permission: text("permission")
    .$type<Permission>()
    .$defaultFn(() => "user"),
  location: point("location"),
});
```

Export DB type in the same file:

```javascript
export type DatabaseUserType = InferSelectModel<typeof users>;
```

Create the zod schema in `@schema/user-schema`:

```javascript
import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),

  email: z.string().email("Invalid email address"), // Validates email format

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character"),
});

// Type inference for TypeScript
export type User = z.infer<typeof userSchema>;
```

Create the routes in `@routes/users`:

```javascript
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
```

Finally export the `router` to be used in `index.ts` file.

## Conclusion

This repo contains an example of how to create an API node backend service using Bun, Hono, DrizzleORM and SQLite. Its much faster since you avoid the chore of installing all the dependencies and configurations needed to create a normal node/express backend with typescript, this has everything we need to start working.

Article writen by me explaining the code: https://adrian-beria-blog.netlify.app/blog/69_creating-a-backend-with-bun-and-hono/

**Made by Engineer Adrian Beria**
