import { getStoredApiUrl } from "./config.js";
export const DEFAULT_API_URL = "https://api.envpull.dev";
export function normalizeApiBase(url) {
    const trimmed = url.trim().replace(/\/$/, "");
    let parsed;
    try {
        parsed = new URL(trimmed);
    }
    catch {
        throw new Error("Invalid API URL");
    }
    const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol === "https:") {
        return trimmed;
    }
    if (parsed.protocol === "http:" && local) {
        return trimmed;
    }
    throw new Error("API URL must use HTTPS (http is only allowed for localhost)");
}
export function getApiBase() {
    const raw = process.env.ENVPULL_API_URL ?? getStoredApiUrl() ?? DEFAULT_API_URL;
    try {
        return normalizeApiBase(raw);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Invalid API URL configured";
        throw new Error(`${message}. Fix with: envpull config set-api https://api.envpull.dev`);
    }
}
export function authHeaders(token) {
    return { Authorization: `Bearer ${token}` };
}
//# sourceMappingURL=api.js.map