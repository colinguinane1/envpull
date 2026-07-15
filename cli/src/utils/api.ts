import { getStoredApiUrl } from "./config.js";

export const DEFAULT_API_URL = "https://api.envpull.dev";

export function getApiBase(): string {
  return (
    process.env.ENVPULL_API_URL ??
    getStoredApiUrl() ??
    DEFAULT_API_URL
  );
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}
