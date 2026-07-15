import fs from "fs";
import path from "path";
import os from "os";
const envpullDir = path.join(os.homedir(), ".envpull");
const configPath = path.join(envpullDir, "config.json");
function ensureDir() {
    if (!fs.existsSync(envpullDir)) {
        fs.mkdirSync(envpullDir, { mode: 0o700 });
    }
}
export function readConfig() {
    if (!fs.existsSync(configPath)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
    catch {
        return {};
    }
}
export function writeConfig(config) {
    ensureDir();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", {
        mode: 0o600,
    });
}
export function updateConfig(patch) {
    const next = { ...readConfig(), ...patch };
    writeConfig(next);
    return next;
}
export function saveToken(token) {
    updateConfig({ token });
}
export function getToken() {
    return readConfig().token ?? null;
}
export function removeToken() {
    const config = readConfig();
    delete config.token;
    if (Object.keys(config).length === 0) {
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
        }
        return;
    }
    writeConfig(config);
}
export function getStoredApiUrl() {
    return readConfig().apiUrl ?? null;
}
export function setApiUrl(apiUrl) {
    updateConfig({ apiUrl: apiUrl.replace(/\/$/, "") });
}
export function isBiometricsEnabled() {
    return readConfig().biometrics === true;
}
export function setBiometricsEnabled(enabled) {
    updateConfig({ biometrics: enabled });
}
//# sourceMappingURL=config.js.map