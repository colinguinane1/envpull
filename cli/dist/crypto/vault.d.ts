import { type KdfParams } from "./constants.js";
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
export declare function createVault(password: string): Promise<{
    masterKey: Buffer;
    vault: VaultPayload;
}>;
export declare function unlockWithPassword(wrap: VaultWrap, password: string): Promise<Buffer>;
export declare function unlockWithRecoveryKey(wrap: VaultWrap, recoveryKey: string): Promise<Buffer>;
export declare function rewrapWithPassword(masterKey: Buffer, password: string, existingWrap: VaultWrap): Promise<Pick<VaultWrap, "passwordWrapSalt" | "wrappedMkByPassword">>;
export declare function encryptEnv(masterKey: Buffer, plaintext: Buffer): Promise<{
    nonce: string;
    ciphertext: string;
}>;
export declare function decryptEnv(masterKey: Buffer, nonce: string, ciphertext: string): Promise<Buffer>;
//# sourceMappingURL=vault.d.ts.map