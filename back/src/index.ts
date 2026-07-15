import { Hono } from "hono";
import { serve } from "@hono/node-server";
import auth from "./routes/auth";
import vault from "./routes/vault";
import projects from "./routes/projects";
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
app.route("/vault", vault);
app.route("/projects", projects);

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOST ?? "0.0.0.0";

serve({
  fetch: app.fetch,
  port,
  hostname,
});

console.log(`API running on http://${hostname}:${port}`);
