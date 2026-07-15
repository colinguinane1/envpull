import { getApiBase, authHeaders } from "../utils/api.js";
import axios from "axios";
import { getProjectConfig } from "../utils/project.js";
import { requireUnlockedMasterKey } from "../utils/unlock.js";
import { encryptEnv } from "../crypto/vault.js";
import { errorMessage, fail } from "../utils/fail.js";
import { requireAuth } from "../utils/auth.js";
import fs from "fs";
import path from "path";
const ENV_FILE = ".env";
export async function pushCommand() {
    try {
        const token = await requireAuth();
        const project = getProjectConfig();
        if (!project) {
            fail("No project linked.\n\nRun: envpull init");
        }
        const envPath = path.join(process.cwd(), ENV_FILE);
        if (!fs.existsSync(envPath)) {
            fail(`No ${ENV_FILE} file found in current directory.`);
        }
        const masterKey = await requireUnlockedMasterKey();
        const plaintext = fs.readFileSync(envPath);
        const encrypted = await encryptEnv(masterKey, plaintext);
        await axios.put(`${getApiBase()}/projects/${project.slug}/env`, encrypted, { headers: authHeaders(token) });
        console.log(`✔ Uploaded encrypted ${ENV_FILE} for ${project.slug}`);
    }
    catch (error) {
        fail(errorMessage(error, "Push failed"));
    }
}
//# sourceMappingURL=push.js.map