import crypto from "crypto";

export function generateRecoveryKey() {
  const bytes = crypto.randomBytes(16);

  return bytes
    .toString("hex")
    .toUpperCase()
    .match(/.{1,4}/g)
    ?.join("-");
}
