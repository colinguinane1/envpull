export type EnvpullConfig = {
    token?: string;
    apiUrl?: string;
    biometrics?: boolean;
};
export declare function readConfig(): EnvpullConfig;
export declare function writeConfig(config: EnvpullConfig): void;
export declare function updateConfig(patch: Partial<EnvpullConfig>): {
    token?: string;
    apiUrl?: string;
    biometrics?: boolean;
};
export declare function saveToken(token: string): void;
export declare function getToken(): string | null;
export declare function removeToken(): void;
export declare function getStoredApiUrl(): string | null;
export declare function setApiUrl(apiUrl: string): void;
export declare function isBiometricsEnabled(): boolean;
export declare function setBiometricsEnabled(enabled: boolean): void;
//# sourceMappingURL=config.d.ts.map