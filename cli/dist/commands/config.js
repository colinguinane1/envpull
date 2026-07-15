import { getStoredApiUrl, isBiometricsEnabled, readConfig, setApiUrl, setBiometricsEnabled, } from "../utils/config.js";
import { getApiBase } from "../utils/api.js";
import { fail } from "../utils/fail.js";
import { restashMasterKey } from "../utils/session.js";
import { errorMessage } from "../utils/fail.js";
export async function configCommand(action, value) {
    if (!action || action === "show") {
        const config = readConfig();
        const source = process.env.ENVPULL_API_URL
            ? "env"
            : getStoredApiUrl()
                ? "config"
                : "default";
        console.log(`apiUrl: ${getApiBase()} (${source})`);
        if (source === "default") {
            console.log(`(override with ENVPULL_API_URL or envpull config set-api)`);
        }
        console.log(`loggedIn: ${config.token ? "yes" : "no"}`);
        console.log(`biometrics: ${isBiometricsEnabled() ? "on" : "off"}${process.platform !== "darwin" ? " (macOS only)" : ""}`);
        return;
    }
    if (action === "set-api") {
        if (!value) {
            fail("Usage: envpull config set-api <url>");
        }
        try {
            new URL(value);
        }
        catch {
            fail("Invalid URL");
        }
        setApiUrl(value);
        console.log(`✔ API URL set to ${value.replace(/\/$/, "")}`);
        return;
    }
    if (action === "set-biometrics") {
        if (process.platform !== "darwin") {
            fail("Touch ID biometrics is only available on macOS.");
        }
        if (value !== "on" && value !== "off") {
            fail("Usage: envpull config set-biometrics on|off");
        }
        const enabled = value === "on";
        setBiometricsEnabled(enabled);
        try {
            const restashed = await restashMasterKey();
            if (enabled) {
                console.log(restashed
                    ? "✔ Touch ID enabled. push/pull will prompt for Touch ID."
                    : "✔ Touch ID enabled. Unlock once with your password (login or push/pull), then Touch ID will be used.");
            }
            else {
                console.log(restashed
                    ? "✔ Touch ID disabled. Vault unlock key stored without biometrics."
                    : "✔ Touch ID disabled.");
            }
        }
        catch (error) {
            fail(errorMessage(error, "Could not update unlock storage"));
        }
        return;
    }
    fail("Usage: envpull config [show|set-api <url>|set-biometrics on|off]");
}
//# sourceMappingURL=config.js.map