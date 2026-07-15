import { confirm, input, password } from "@inquirer/prompts";
import axios from "axios";
import { saveToken } from "../utils/config.js";
import { getApiBase, authHeaders } from "../utils/api.js";
import {
  rewrapWithPassword,
  unlockWithRecoveryKey,
  type VaultWrap,
} from "../crypto/vault.js";
import { setMasterKey } from "../utils/session.js";
import { errorMessage, fail } from "../utils/fail.js";

export async function recoverCommand() {
  try {
    const email = (
      await input({
        message: "Email:",
      })
    )
      .trim()
      .toLowerCase();

    if (!email) {
      fail("Email is required");
    }

    const recoveryKey = await input({
      message: "Recovery key:",
    });

    const newPassword = await password({
      message: "New password:",
    });
    const confirmPassword = await password({
      message: "Confirm new password:",
    });

    if (newPassword !== confirmPassword) {
      fail("Passwords do not match");
    }

    const start = await axios.post(`${getApiBase()}/auth/recover`, {
      email,
      recoveryKey: recoveryKey.trim(),
    });

    const wrap = start.data.vault as VaultWrap;
    const recoverToken = start.data.recoverToken as string;

    const masterKey = await unlockWithRecoveryKey(wrap, recoveryKey.trim());
    const rewrapped = await rewrapWithPassword(masterKey, newPassword, wrap);

    const complete = await axios.post(
      `${getApiBase()}/auth/recover/complete`,
      {
        ...rewrapped,
        password: newPassword,
      },
      { headers: authHeaders(recoverToken) },
    );

    saveToken(complete.data.token);
    await setMasterKey(masterKey);

    const saved = await confirm({
      message: "I still have my recovery key saved somewhere safe",
      default: true,
    });
    if (!saved) {
      console.log(
        "Your existing recovery key still unlocks this account — store it safely.",
      );
    }

    console.log("✔ Password reset. Vault unlocked until logout.");
  } catch (error) {
    fail(errorMessage(error, "Recovery failed"));
  }
}
