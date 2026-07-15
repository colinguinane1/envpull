import { SignJWT, jwtVerify } from "jose";

export type TokenPurpose = "session" | "recover";

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function createToken(
  userId: string,
  purpose: TokenPurpose = "session",
  expiresIn = purpose === "recover" ? "10m" : "7d",
) {
  return await new SignJWT({
    userId,
    purpose,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return {
    userId: payload.userId as string,
    purpose: (payload.purpose as TokenPurpose | undefined) ?? "session",
  };
}
