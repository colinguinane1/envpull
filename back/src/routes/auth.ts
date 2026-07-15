import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { createToken } from "../lib/jwt.js";
import {
  authMiddleware,
  recoverMiddleware,
  type AuthEnv,
} from "../lib/authMiddleware.js";
import { clientKey, rateLimit } from "../lib/rateLimit.js";

const auth = new Hono<AuthEnv>();

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
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password required" }, 400);
  }

  const limited = rateLimit(clientKey(c.req.header("x-forwarded-for"), email));
  if (!limited.ok) {
    return c.json(
      { error: "Too many attempts. Try again later." },
      429,
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    if (!hasVaultPayload(body)) {
      return c.json({ error: "Vault payload required for signup" }, 400);
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
  }

  const validPassword = await bcrypt.compare(
    password,
    existingUser.passwordHash,
  );

  if (!validPassword) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await createToken(existingUser.id, "session");

  return c.json({ token, isNewUser: false });
});

auth.post("/recover", async (c) => {
  const body = await c.req.json();
  const { email, recoveryKey } = body;

  if (!email || !recoveryKey) {
    return c.json({ error: "Email and recovery key required" }, 400);
  }

  const limited = rateLimit(clientKey(c.req.header("x-forwarded-for"), email));
  if (!limited.ok) {
    return c.json(
      { error: "Too many attempts. Try again later." },
      429,
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.recoveryKeyHash || !user.wrappedMkByRecovery) {
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
