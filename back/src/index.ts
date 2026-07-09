import { Hono } from "hono";
import { serve } from "@hono/node-server";
import auth from "./routes/auth";
import { logger } from "hono/logger";

const app = new Hono();

app.use("*", logger());

app.get("/", (c) => {
  return c.text("envpull API running");
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
  });
});

app.route("/auth", auth);

serve({
  fetch: app.fetch,
  port: 3000,
});

console.log("API running on http://localhost:3000");
