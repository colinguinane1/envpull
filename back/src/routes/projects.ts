import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthEnv } from "../lib/authMiddleware.js";

const projects = new Hono<AuthEnv>();

projects.use("*", authMiddleware);

projects.get("/", async (c) => {
  const userId = c.get("userId");

  const items = await prisma.project.findMany({
    where: { userId },
    select: { id: true, name: true, slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return c.json(items);
});

projects.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const { name, slug } = body;

  if (!name || !slug) {
    return c.json({ error: "Name and slug required" }, 400);
  }

  const existing = await prisma.project.findUnique({
    where: { userId_slug: { userId, slug } },
  });

  if (existing) {
    return c.json(existing);
  }

  const project = await prisma.project.create({
    data: { userId, name, slug },
  });

  return c.json(project, 201);
});

projects.get("/:slug/env", async (c) => {
  const userId = c.get("userId");
  const slug = c.req.param("slug");

  const project = await prisma.project.findUnique({
    where: { userId_slug: { userId, slug } },
    include: { envSnapshots: true },
  });

  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  const snapshot = project.envSnapshots[0];
  if (!snapshot) {
    return c.json({ error: "No env uploaded yet" }, 404);
  }

  return c.json({
    nonce: snapshot.nonce,
    ciphertext: snapshot.ciphertext,
    version: snapshot.version,
    updatedAt: snapshot.updatedAt,
  });
});

projects.put("/:slug/env", async (c) => {
  const userId = c.get("userId");
  const slug = c.req.param("slug");
  const body = await c.req.json();
  const { nonce, ciphertext, version = 1 } = body;

  if (!nonce || !ciphertext) {
    return c.json({ error: "Nonce and ciphertext required" }, 400);
  }

  const project = await prisma.project.findUnique({
    where: { userId_slug: { userId, slug } },
  });

  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  const snapshot = await prisma.envSnapshot.upsert({
    where: { projectId: project.id },
    create: {
      projectId: project.id,
      nonce,
      ciphertext,
      version,
    },
    update: {
      nonce,
      ciphertext,
      version,
    },
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { updatedAt: new Date() },
  });

  return c.json({
    ok: true,
    updatedAt: snapshot.updatedAt,
  });
});

export default projects;
