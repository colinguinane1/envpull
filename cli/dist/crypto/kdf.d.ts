import { type KdfParams } from "./constants.js";
export declare function generateSalt(): Buffer;
export declare function deriveKey(secret: string, salt: Buffer, params?: KdfParams): Promise<Buffer>;
//# sourceMappingURL=kdf.d.ts.map