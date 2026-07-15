import fs from "fs";
import path from "path";
import axios from "axios";
import { getToken } from "../utils/config.js";
import { getApiBase, authHeaders } from "../utils/api.js";
import { getProjectConfig } from "../utils/project.js";
import { requireUnlockedMasterKey } from "../utils/unlock.js";
import { decryptEnv } from "../crypto/vault.js";
import { errorMessage, fail } from "../utils/fail.js";

const ENV_FILE = ".env";

export async function pullCommand() {
  try {
    const token = getToken();
    if (!token) {
      fail("Not logged in. Run envpull login first.");
    }

    const project = getProjectConfig();
    if (!project) {
      fail("No project linked. Run envpull init in this directory first.");
    }

    const masterKey = await requireUnlockedMasterKey();

    const response = await axios.get(
      `${getApiBase()}/projects/${project.slug}/env`,
      { headers: authHeaders(token) },
    );

    const plaintext = await decryptEnv(
      masterKey,
      response.data.nonce,
      response.data.ciphertext,
    );

    const envPath = path.join(process.cwd(), ENV_FILE);
    fs.writeFileSync(envPath, plaintext);

    console.log(`✔ Downloaded and decrypted ${ENV_FILE} for ${project.slug}`);
  } catch (error) {
    fail(errorMessage(error, "Pull failed"));
  }
}
