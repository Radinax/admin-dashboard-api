import { Hono } from "hono";
import { logger } from "hono/logger";
import { migrate } from "./db";
import usersRoute from "./routes/users";
import ordersRoute from "./routes/orders";
import productsRoute from "./routes/products";
import { cors } from "hono/cors";

// Apply migrations
migrate();

const app = new Hono();

app.use(logger());

app.use(
  "*",
  cors({
    origin: "http://localhost:5173", // Change to ENV
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 86400,
    credentials: true,
  })
);

app.route("/", usersRoute);
app.route("/orders", ordersRoute);
app.route("/products", productsRoute);

export default {
  port: 5000,
  fetch: app.fetch,
};
