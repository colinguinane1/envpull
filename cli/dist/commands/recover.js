import { input, password } from "@inquirer/prompts";
import axios from "axios";
import { saveToken } from "../utils/config.js";
import { getApiBase, authHeaders } from "../utils/api.js";
import { rewrapWithPassword, unlockWithRecoveryKey, } from "../crypto/vault.js";
import { setMasterKey } from "../utils/session.js";
import { errorMessage, fail } from "../utils/fail.js";
export async function recoverCommand() {
    try {
        const email = await input({
            message: "Email:",
        });
        const recoveryKey = await input({
            message: "Recovery key:",
        });
        const newPassword = await password({
            message: "New password:",
        });
        const start = await axios.post(`${getApiBase()}/auth/recover`, {
            email,
            recoveryKey: recoveryKey.trim(),
        });
        const wrap = start.data.vault;
        const recoverToken = start.data.recoverToken;
        const masterKey = await unlockWithRecoveryKey(wrap, recoveryKey.trim());
        const rewrapped = await rewrapWithPassword(masterKey, newPassword, wrap);
        const complete = await axios.post(`${getApiBase()}/auth/recover/complete`, {
            ...rewrapped,
            password: newPassword,
        }, { headers: authHeaders(recoverToken) });
        saveToken(complete.data.token);
        await setMasterKey(masterKey);
        console.log("✔ Password reset. Vault unlocked until logout.");
    }
    catch (error) {
        fail(errorMessage(error, "Recovery failed"));
    }
}
//# sourceMappingURL=recover.js.map