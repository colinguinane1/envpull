import { type VaultWrap } from "../crypto/vault.js";
export declare function fetchVaultWrap(): Promise<VaultWrap>;
export declare function requireUnlockedMasterKey(promptMessage?: string): Promise<Buffer>;
export declare function lockVault(): Promise<void>;
//# sourceMappingURL=unlock.d.ts.map