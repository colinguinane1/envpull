export const VAULT_VERSION = 1;
export const MASTER_KEY_BYTES = 32;
export const SALT_BYTES = 16;
export const GCM_NONCE_BYTES = 12;

export const DEFAULT_KDF_PARAMS = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
} as const;

export type KdfParams = typeof DEFAULT_KDF_PARAMS;
