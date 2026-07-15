import axios from "axios";
import { getToken, removeToken } from "./config.js";
import { getApiBase, authHeaders } from "./api.js";
import { fail } from "./fail.js";
export function failLoginRequired() {
    fail("Not logged in.\n\nRun: envpull login");
}
/** Returns a valid session token, or exits with login instructions. */
export async function requireAuth() {
    const token = getToken();
    if (!token) {
        failLoginRequired();
    }
    try {
        await axios.get(`${getApiBase()}/auth/me`, {
            headers: authHeaders(token),
            validateStatus: (status) => status >= 200 && status < 300,
        });
        return token;
    }
    catch {
        removeToken();
        failLoginRequired();
    }
}
//# sourceMappingURL=auth.js.map