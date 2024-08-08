# api-bun-hono

Personal backend stack for private SAAS projects as a showcase for new members.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

To run initial migrations:

```bash
bun drizzle-kit generate
```

```json
// Error example

{
  "success": false,
  "error": {
    "issues": [
      {
        "validation": "email",
        "code": "invalid_string",
        "message": "Invalid email address",
        "path": ["email"]
      },
      {
        "validation": "regex",
        "code": "invalid_string",
        "message": "Password must contain at least one uppercase letter",
        "path": ["password"]
      },
      {
        "validation": "regex",
        "code": "invalid_string",
        "message": "Password must contain at least one number",
        "path": ["password"]
      },
      {
        "validation": "regex",
        "code": "invalid_string",
        "message": "Password must contain at least one special character",
        "path": ["password"]
      }
    ],
    "name": "ZodError"
  }
}
```

Credentionals:

```json
{
  "username": "Xanidar",
  "email": "xanidar@xanidar.com",
  "password": "Xanidar.9"
}
```

Authorized user sending bad request:

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "invalid_type",
        "expected": "number",
        "received": "string",
        "path": ["price"],
        "message": "Expected number, received string"
      }
    ],
    "name": "ZodError"
  }
}
```

Article writen by me explaining the code: https://adrian-beria-blog.netlify.app/blog/69_creating-a-backend-with-bun-and-hono/

This project was created using `bun init` in bun v1.1.12. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
