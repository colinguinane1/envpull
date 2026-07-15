import type { Context, Next } from "hono";
import { verifyToken, type TokenPurpose } from "./jwt.js";

export type AuthEnv = {
  Variables: {
    userId: string;
    purpose: TokenPurpose;
  };
};

function extractToken(c: Context) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return null;
  }
  return authHeader.split(" ")[1] ?? null;
}

export function requirePurpose(...allowed: TokenPurpose[]) {
  return async (c: Context<AuthEnv>, next: Next) => {
    const token = extractToken(c);

    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const payload = await verifyToken(token);

      if (!allowed.includes(payload.purpose)) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      c.set("userId", payload.userId);
      c.set("purpose", payload.purpose);

      await next();
    } catch {
      return c.json({ error: "Invalid token" }, 401);
    }
  };
}

export const authMiddleware = requirePurpose("session");
export const recoverMiddleware = requirePurpose("recover");
