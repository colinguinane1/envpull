import crypto from "node:crypto";
import { GCM_NONCE_BYTES } from "./constants.js";

const ALGORITHM = "aes-256-gcm";
const AUTH_TAG_BYTES = 16;

export async function aesGcmEncrypt(
  key: Buffer,
  plaintext: Buffer,
): Promise<{ nonce: Buffer; ciphertext: Buffer }> {
  const nonce = crypto.randomBytes(GCM_NONCE_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, nonce);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    nonce,
    ciphertext: Buffer.concat([encrypted, tag]),
  };
}

export async function aesGcmDecrypt(
  key: Buffer,
  nonce: Buffer,
  ciphertext: Buffer,
): Promise<Buffer> {
  const encrypted = ciphertext.subarray(0, ciphertext.length - AUTH_TAG_BYTES);
  const tag = ciphertext.subarray(ciphertext.length - AUTH_TAG_BYTES);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, nonce);
  decipher.setAuthTag(tag);

  try {
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  } catch {
    throw new Error("Decryption failed");
  }
}

export function packNonceAndCiphertext(nonce: Buffer, ciphertext: Buffer): string {
  return Buffer.concat([nonce, ciphertext]).toString("base64");
}

export function unpackNonceAndCiphertext(packed: string): {
  nonce: Buffer;
  ciphertext: Buffer;
} {
  const buf = Buffer.from(packed, "base64");
  return {
    nonce: buf.subarray(0, GCM_NONCE_BYTES),
    ciphertext: buf.subarray(GCM_NONCE_BYTES),
  };
}
