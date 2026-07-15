import { Hono } from "hono";
import { serve } from "@hono/node-server";
import auth from "./routes/auth.js";
import vault from "./routes/vault.js";
import projects from "./routes/projects.js";
import { logger } from "hono/logger";

function requireEnv() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    console.error(
      "Fatal: JWT_SECRET must be set and at least 32 characters long",
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("Fatal: DATABASE_URL must be set");
    process.exit(1);
  }
}

requireEnv();

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
