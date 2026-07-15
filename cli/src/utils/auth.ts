import axios from "axios";
import { getToken, removeToken } from "./config.js";
import { getApiBase, authHeaders } from "./api.js";
import { clearMasterKey } from "./session.js";
import { errorMessage, fail } from "./fail.js";

export function failLoginRequired(): never {
  fail("Not logged in.\n\nRun: envpull login");
}

/** Returns a valid session token, or exits with login instructions. */
export async function requireAuth(): Promise<string> {
  const token = getToken();
  if (!token) {
    failLoginRequired();
  }

  let base: string;
  try {
    base = getApiBase();
  } catch (error) {
    fail(errorMessage(error, "Invalid API URL"));
  }

  try {
    await axios.get(`${base}/auth/me`, {
      headers: authHeaders(token),
      validateStatus: (status) => status >= 200 && status < 300,
    });
    return token;
  } catch {
    removeToken();
    await clearMasterKey();
    failLoginRequired();
  }
}
