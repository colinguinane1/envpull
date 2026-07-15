import crypto from "node:crypto";
import {
  DEFAULT_KDF_PARAMS,
  MASTER_KEY_BYTES,
  type KdfParams,
} from "./constants.js";
import { deriveKey, generateSalt } from "./kdf.js";
import {
  aesGcmDecrypt,
  aesGcmEncrypt,
  packNonceAndCiphertext,
  unpackNonceAndCiphertext,
} from "./aes.js";

export type VaultWrap = {
  kdfParams: KdfParams;
  passwordWrapSalt: string;
  wrappedMkByPassword: string;
  recoveryWrapSalt: string;
  wrappedMkByRecovery: string;
};

export type VaultPayload = VaultWrap & {
  recoveryKey: string;
};

function generateRecoveryKey(): string {
  return crypto
    .randomBytes(16)
    .toString("hex")
    .toUpperCase()
    .match(/.{1,4}/g)!
    .join("-");
}

function generateMasterKey(): Buffer {
  return crypto.randomBytes(MASTER_KEY_BYTES);
}

async function wrapMasterKey(
  masterKey: Buffer,
  secret: string,
  salt: Buffer,
  kdfParams: KdfParams,
): Promise<string> {
  const kek = await deriveKey(secret, salt, kdfParams);
  const { nonce, ciphertext } = await aesGcmEncrypt(kek, masterKey);
  return packNonceAndCiphertext(nonce, ciphertext);
}

async function unwrapMasterKey(
  wrapped: string,
  secret: string,
  salt: Buffer,
  kdfParams: KdfParams,
): Promise<Buffer> {
  const kek = await deriveKey(secret, salt, kdfParams);
  const { nonce, ciphertext } = unpackNonceAndCiphertext(wrapped);

  try {
    return await aesGcmDecrypt(kek, nonce, ciphertext);
  } catch {
    throw new Error("Invalid password or recovery key");
  }
}

export async function createVault(password: string): Promise<{
  masterKey: Buffer;
  vault: VaultPayload;
}> {
  const kdfParams = DEFAULT_KDF_PARAMS;
  const masterKey = generateMasterKey();
  const recoveryKey = generateRecoveryKey();

  const passwordWrapSalt = generateSalt();
  const recoveryWrapSalt = generateSalt();

  const wrappedMkByPassword = await wrapMasterKey(
    masterKey,
    password,
    passwordWrapSalt,
    kdfParams,
  );
  const wrappedMkByRecovery = await wrapMasterKey(
    masterKey,
    recoveryKey,
    recoveryWrapSalt,
    kdfParams,
  );

  return {
    masterKey,
    vault: {
      kdfParams,
      passwordWrapSalt: passwordWrapSalt.toString("base64"),
      wrappedMkByPassword,
      recoveryWrapSalt: recoveryWrapSalt.toString("base64"),
      wrappedMkByRecovery,
      recoveryKey,
    },
  };
}

export async function unlockWithPassword(
  wrap: VaultWrap,
  password: string,
): Promise<Buffer> {
  return unwrapMasterKey(
    wrap.wrappedMkByPassword,
    password,
    Buffer.from(wrap.passwordWrapSalt, "base64"),
    wrap.kdfParams,
  );
}

export async function unlockWithRecoveryKey(
  wrap: VaultWrap,
  recoveryKey: string,
): Promise<Buffer> {
  return unwrapMasterKey(
    wrap.wrappedMkByRecovery,
    recoveryKey,
    Buffer.from(wrap.recoveryWrapSalt, "base64"),
    wrap.kdfParams,
  );
}

export async function rewrapWithPassword(
  masterKey: Buffer,
  password: string,
  existingWrap: VaultWrap,
): Promise<Pick<VaultWrap, "passwordWrapSalt" | "wrappedMkByPassword">> {
  const passwordWrapSalt = generateSalt();
  const wrappedMkByPassword = await wrapMasterKey(
    masterKey,
    password,
    passwordWrapSalt,
    existingWrap.kdfParams,
  );

  return {
    passwordWrapSalt: passwordWrapSalt.toString("base64"),
    wrappedMkByPassword,
  };
}

export async function encryptEnv(
  masterKey: Buffer,
  plaintext: Buffer,
): Promise<{ nonce: string; ciphertext: string }> {
  const { nonce, ciphertext } = await aesGcmEncrypt(masterKey, plaintext);
  return {
    nonce: nonce.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}

export async function decryptEnv(
  masterKey: Buffer,
  nonce: string,
  ciphertext: string,
): Promise<Buffer> {
  return aesGcmDecrypt(
    masterKey,
    Buffer.from(nonce, "base64"),
    Buffer.from(ciphertext, "base64"),
  );
}
