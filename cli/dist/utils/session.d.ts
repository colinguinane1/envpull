export declare function setMasterKey(key: Buffer): Promise<void>;
export declare function getMasterKey(): Promise<Buffer | null>;
export declare function clearMasterKey(): Promise<void>;
/** Re-store the current unlock key under the active biometrics setting. */
export declare function restashMasterKey(): Promise<boolean>;
//# sourceMappingURL=session.d.ts.map