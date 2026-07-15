export declare const VAULT_VERSION = 1;
export declare const MASTER_KEY_BYTES = 32;
export declare const SALT_BYTES = 16;
export declare const GCM_NONCE_BYTES = 12;
export declare const DEFAULT_KDF_PARAMS: {
    readonly memoryCost: 65536;
    readonly timeCost: 3;
    readonly parallelism: 4;
};
export type KdfParams = typeof DEFAULT_KDF_PARAMS;
//# sourceMappingURL=constants.d.ts.map