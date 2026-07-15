import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthEnv } from "../lib/authMiddleware.js";

const vault = new Hono<AuthEnv>();

vault.use("*", authMiddleware);

vault.get("/", async (c) => {
  const userId = c.get("userId");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      kdfParams: true,
      passwordWrapSalt: true,
      wrappedMkByPassword: true,
      recoveryWrapSalt: true,
      wrappedMkByRecovery: true,
    },
  });

  if (!user?.wrappedMkByPassword || !user.passwordWrapSalt) {
    return c.json({ error: "Vault not initialized" }, 404);
  }

  return c.json({
    kdfParams: user.kdfParams,
    passwordWrapSalt: user.passwordWrapSalt,
    wrappedMkByPassword: user.wrappedMkByPassword,
    recoveryWrapSalt: user.recoveryWrapSalt,
    wrappedMkByRecovery: user.wrappedMkByRecovery,
  });
});

export default vault;
