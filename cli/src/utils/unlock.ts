import axios from "axios";
import { password } from "@inquirer/prompts";
import { getApiBase, authHeaders } from "./api.js";
import {
  getMasterKey,
  setMasterKey,
  clearMasterKey,
} from "./session.js";
import {
  unlockWithPassword,
  type VaultWrap,
} from "../crypto/vault.js";
import { errorMessage, fail } from "./fail.js";
import { requireAuth } from "./auth.js";

export async function fetchVaultWrap(): Promise<VaultWrap> {
  const token = await requireAuth();

  try {
    const response = await axios.get(`${getApiBase()}/vault`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    fail(errorMessage(error, "Could not load vault"));
  }
}

export async function requireUnlockedMasterKey(
  promptMessage = "Password:",
): Promise<Buffer> {
  await requireAuth();

  try {
    const cached = await getMasterKey();
    if (cached) {
      return cached;
    }
  } catch (error) {
    const message = errorMessage(error, "Touch ID unlock failed");
    console.error(`${message}. Falling back to password.`);
  }

  const pwd = await password({ message: promptMessage });

  try {
    const wrap = await fetchVaultWrap();
    const masterKey = await unlockWithPassword(wrap, pwd);
    await setMasterKey(masterKey);
    return masterKey;
  } catch (error) {
    fail(errorMessage(error, "Could not unlock vault"));
  }
}

export async function lockVault() {
  await clearMasterKey();
}
