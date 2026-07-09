import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { createToken } from "../lib/jwt";
import { jwtVerify } from "jose";

const auth = new Hono();

export const authMiddleware = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    c.set("userId", payload.userId as string);

    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
};

auth.get("/test", (c) => {
  return c.json({
    message: "auth route working",
  });
});

auth.use("/me", authMiddleware);

auth.get("/me", async (c) => {
  const userId = c.get("userId");

  const user = await prisma.user.findUnique({
    where: { id: userId as string },
    select: { id: true, email: true, createdAt: true },
  });

  return c.json(user);
});

// sign up will act as both signup and login
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password required" }, 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({ data: { email, passwordHash } });

    const token = await createToken(user.id);

    return c.json({ token });
  }

  const validPassword = bcrypt.compare(password, existingUser?.passwordHash);

  if (!validPassword) {
    return c.json({ error: "User exists but has invalid credentials" }, 401);
  }

  const token = await createToken(existingUser.id);

  return c.json({ token });
});

auth.post("/login-2", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return c.json({ error: "Invalid credentials OR no user found" }, 401);
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    return c.json({ error: "Invalid credentials." }, 401);
  }

  const token = await createToken(user.id);

  return c.json({ token });
});
export default auth;
