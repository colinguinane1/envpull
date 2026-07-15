import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { createToken } from "../lib/jwt.js";
import {
  authMiddleware,
  recoverMiddleware,
  type AuthEnv,
} from "../lib/authMiddleware.js";
import { clientIp, clientKey, rateLimit } from "../lib/rateLimit.js";

const auth = new Hono<AuthEnv>();

/** Precomputed bcrypt hash used only to equalize login timing when the user is missing. */
const DUMMY_PASSWORD_HASH =
  "$2b$10$mAgBszrPAORahnL3BJ84IuwIn.iRNx.VejuZnL.IRDQk9/.8ObwTC";

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") {
    return null;
  }
  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function applyRateLimit(
  c: { req: { header: (name: string) => string | undefined }; header: (name: string, value: string) => void },
  email: string,
) {
  const limited = rateLimit(
    clientKey(clientIp(c.req.header("x-forwarded-for")), email),
  );
  if (!limited.ok) {
    c.header("Retry-After", String(limited.retryAfterSec));
    return true;
  }
  return false;
}

auth.use("/me", authMiddleware);

auth.get("/me", async (c) => {
  const userId = c.get("userId");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, createdAt: true },
  });

  return c.json(user);
});

type VaultSignupPayload = {
  kdfParams: unknown;
  passwordWrapSalt: string;
  wrappedMkByPassword: string;
  recoveryWrapSalt: string;
  wrappedMkByRecovery: string;
  recoveryKey: string;
};

function hasVaultPayload(body: unknown): body is VaultSignupPayload {
  if (!body || typeof body !== "object") {
    return false;
  }

  const vault = body as VaultSignupPayload;
  return (
    !!vault.kdfParams &&
    !!vault.passwordWrapSalt &&
    !!vault.wrappedMkByPassword &&
    !!vault.recoveryWrapSalt &&
    !!vault.wrappedMkByRecovery &&
    !!vault.recoveryKey
  );
}

auth.post("/login", async (c) => {
  const body = await c.req.json();
  const email = normalizeEmail(body.email);
  const password = body.password;

  if (!email || !password || typeof password !== "string") {
    return c.json({ error: "Email and password required" }, 400);
  }

  if (applyRateLimit(c, email)) {
    return c.json({ error: "Too many attempts. Try again later." }, 429);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  const validPassword = await bcrypt.compare(
    password,
    existingUser?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );

  if (!existingUser || !validPassword) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await createToken(existingUser.id, "session");

  return c.json({ token, isNewUser: false });
});

auth.post("/signup", async (c) => {
  const body = await c.req.json();
  const email = normalizeEmail(body.email);
  const password = body.password;

  if (!email || !password || typeof password !== "string") {
    return c.json({ error: "Email and password required" }, 400);
  }

  if (!hasVaultPayload(body)) {
    return c.json({ error: "Vault payload required" }, 400);
  }

  if (applyRateLimit(c, email)) {
    return c.json({ error: "Too many attempts. Try again later." }, 429);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return c.json({ error: "Account already exists" }, 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const recoveryKeyHash = await bcrypt.hash(body.recoveryKey, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      recoveryKeyHash,
      kdfParams: body.kdfParams as object,
      passwordWrapSalt: body.passwordWrapSalt,
      wrappedMkByPassword: body.wrappedMkByPassword,
      recoveryWrapSalt: body.recoveryWrapSalt,
      wrappedMkByRecovery: body.wrappedMkByRecovery,
    },
  });

  const token = await createToken(user.id, "session");

  return c.json({ token, isNewUser: true });
});

auth.post("/recover", async (c) => {
  const body = await c.req.json();
  const email = normalizeEmail(body.email);
  const recoveryKey = body.recoveryKey;

  if (!email || !recoveryKey || typeof recoveryKey !== "string") {
    return c.json({ error: "Email and recovery key required" }, 400);
  }

  if (applyRateLimit(c, email)) {
    return c.json({ error: "Too many attempts. Try again later." }, 429);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.recoveryKeyHash || !user.wrappedMkByRecovery) {
    await bcrypt.compare(recoveryKey, DUMMY_PASSWORD_HASH);
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await bcrypt.compare(recoveryKey, user.recoveryKeyHash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const recoverToken = await createToken(user.id, "recover");

  return c.json({
    recoverToken,
    vault: {
      kdfParams: user.kdfParams,
      passwordWrapSalt: user.passwordWrapSalt,
      wrappedMkByPassword: user.wrappedMkByPassword,
      recoveryWrapSalt: user.recoveryWrapSalt,
      wrappedMkByRecovery: user.wrappedMkByRecovery,
    },
  });
});

auth.use("/recover/complete", recoverMiddleware);

auth.post("/recover/complete", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const { password, passwordWrapSalt, wrappedMkByPassword } = body;

  if (!password || !passwordWrapSalt || !wrappedMkByPassword) {
    return c.json({ error: "Missing rewrap fields" }, 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordWrapSalt,
      wrappedMkByPassword,
    },
  });

  const token = await createToken(userId, "session");

  return c.json({ token });
});

export default auth;
