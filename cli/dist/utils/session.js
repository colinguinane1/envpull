import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { isBiometricsEnabled } from "./config.js";
const execFileAsync = promisify(execFile);
const envpullDir = path.join(os.homedir(), ".envpull");
const unlockPath = path.join(envpullDir, "unlocked.key");
const helperBinPath = path.join(envpullDir, "bin", "envpull-keychain");
const KEYCHAIN_SERVICE = "envpull-master-key";
const KEYCHAIN_ACCOUNT = "envpull";
let memoryKey = null;
let warnedFileFallback = false;
function ensureDir() {
    if (!fs.existsSync(envpullDir)) {
        fs.mkdirSync(envpullDir, { mode: 0o700 });
    }
}
function helperSourcePath() {
    const here = path.dirname(fileURLToPath(import.meta.url));
    // src/utils -> ../native, or dist/utils -> ../../native
    const candidates = [
        path.resolve(here, "../native/KeychainHelper.swift"),
        path.resolve(here, "../../native/KeychainHelper.swift"),
    ];
    return candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
}
async function ensureBioHelper() {
    ensureDir();
    const binDir = path.dirname(helperBinPath);
    if (!fs.existsSync(binDir)) {
        fs.mkdirSync(binDir, { mode: 0o700 });
    }
    const source = helperSourcePath();
    const needsBuild = !fs.existsSync(helperBinPath) ||
        fs.statSync(helperBinPath).mtimeMs < fs.statSync(source).mtimeMs;
    if (needsBuild) {
        await execFileAsync("swiftc", [
            "-O",
            source,
            "-o",
            helperBinPath,
            "-framework",
            "LocalAuthentication",
            "-framework",
            "Security",
        ]);
        fs.chmodSync(helperBinPath, 0o700);
    }
    return helperBinPath;
}
async function bioSet(value) {
    if (process.platform !== "darwin") {
        return false;
    }
    try {
        const helper = await ensureBioHelper();
        await execFileAsync(helper, ["set", value]);
        return true;
    }
    catch {
        return false;
    }
}
async function bioGet() {
    if (process.platform !== "darwin") {
        return null;
    }
    try {
        const helper = await ensureBioHelper();
        const { stdout } = await execFileAsync(helper, ["get"]);
        const value = stdout.trim();
        return value.length > 0 ? value : null;
    }
    catch (error) {
        const code = error.code;
        if (code === 3) {
            return null;
        }
        throw error;
    }
}
async function bioDelete() {
    if (process.platform !== "darwin") {
        return;
    }
    try {
        const helper = await ensureBioHelper();
        await execFileAsync(helper, ["delete"]);
    }
    catch {
        // ignore
    }
}
async function keychainSet(value) {
    if (process.platform !== "darwin") {
        return false;
    }
    try {
        await execFileAsync("security", [
            "add-generic-password",
            "-a",
            KEYCHAIN_ACCOUNT,
            "-s",
            KEYCHAIN_SERVICE,
            "-w",
            value,
            "-U",
        ]);
        return true;
    }
    catch {
        return false;
    }
}
async function keychainGet() {
    if (process.platform !== "darwin") {
        return null;
    }
    try {
        const { stdout } = await execFileAsync("security", [
            "find-generic-password",
            "-a",
            KEYCHAIN_ACCOUNT,
            "-s",
            KEYCHAIN_SERVICE,
            "-w",
        ]);
        const value = stdout.trim();
        return value.length > 0 ? value : null;
    }
    catch {
        return null;
    }
}
async function keychainDelete() {
    if (process.platform !== "darwin") {
        return;
    }
    try {
        await execFileAsync("security", [
            "delete-generic-password",
            "-a",
            KEYCHAIN_ACCOUNT,
            "-s",
            KEYCHAIN_SERVICE,
        ]);
    }
    catch {
        // already absent
    }
}
function writeFileFallback(key) {
    ensureDir();
    fs.writeFileSync(unlockPath, key.toString("base64"), { mode: 0o600 });
    if (!warnedFileFallback) {
        warnedFileFallback = true;
        console.error("Note: vault unlock key stored in ~/.envpull/unlocked.key (keychain unavailable)");
    }
}
function readFileFallback() {
    if (!fs.existsSync(unlockPath)) {
        return null;
    }
    try {
        const raw = fs.readFileSync(unlockPath, "utf8").trim();
        return Buffer.from(raw, "base64");
    }
    catch {
        return null;
    }
}
export async function setMasterKey(key) {
    memoryKey = key;
    const encoded = key.toString("base64");
    if (isBiometricsEnabled()) {
        const stored = await bioSet(encoded);
        if (stored) {
            await keychainDelete();
            if (fs.existsSync(unlockPath)) {
                fs.unlinkSync(unlockPath);
            }
            return;
        }
        console.error("Touch ID storage unavailable; falling back to regular keychain/file.");
    }
    await bioDelete();
    const stored = await keychainSet(encoded);
    if (stored) {
        if (fs.existsSync(unlockPath)) {
            fs.unlinkSync(unlockPath);
        }
        return;
    }
    writeFileFallback(key);
}
export async function getMasterKey() {
    if (memoryKey) {
        return memoryKey;
    }
    if (isBiometricsEnabled()) {
        try {
            const fromBio = await bioGet();
            if (fromBio) {
                memoryKey = Buffer.from(fromBio, "base64");
                return memoryKey;
            }
        }
        catch (error) {
            const err = error;
            const stderr = typeof err.stderr === "string"
                ? err.stderr
                : Buffer.isBuffer(err.stderr)
                    ? err.stderr.toString("utf8")
                    : "";
            throw new Error(stderr.trim() || err.message || "Touch ID unlock failed");
        }
    }
    const fromKeychain = await keychainGet();
    if (fromKeychain) {
        memoryKey = Buffer.from(fromKeychain, "base64");
        return memoryKey;
    }
    const fromFile = readFileFallback();
    if (fromFile) {
        memoryKey = fromFile;
        return memoryKey;
    }
    return null;
}
export async function clearMasterKey() {
    memoryKey = null;
    await bioDelete();
    await keychainDelete();
    if (fs.existsSync(unlockPath)) {
        fs.unlinkSync(unlockPath);
    }
}
/** Re-store the current unlock key under the active biometrics setting. */
export async function restashMasterKey() {
    const key = await getMasterKey();
    if (!key) {
        return false;
    }
    await setMasterKey(key);
    return true;
}
//# sourceMappingURL=session.js.map