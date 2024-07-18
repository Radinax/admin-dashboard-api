import { Hono } from "hono";
import { logger } from "hono/logger";
import { migrate } from "./db";
import usersRoute from "./routes/users";
import ordersRoute from "./routes/orders";
import productsRoute from "./routes/products";

// Apply migrations
migrate();

const app = new Hono();

app.use(logger());

app.route("/", usersRoute);
app.route("/orders", ordersRoute);
app.route("/products", productsRoute);

export default {
  port: 5000,
  fetch: app.fetch,
};
