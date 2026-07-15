import argon2 from "argon2";
import crypto from "node:crypto";
import { DEFAULT_KDF_PARAMS, SALT_BYTES } from "./constants.js";
export function generateSalt() {
    return crypto.randomBytes(SALT_BYTES);
}
export async function deriveKey(secret, salt, params = DEFAULT_KDF_PARAMS) {
    const hash = await argon2.hash(secret, {
        type: argon2.argon2id,
        salt,
        hashLength: 32,
        memoryCost: params.memoryCost,
        timeCost: params.timeCost,
        parallelism: params.parallelism,
        raw: true,
    });
    return Buffer.from(hash);
}
//# sourceMappingURL=kdf.js.map