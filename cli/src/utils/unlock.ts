import axios from "axios";
import { password } from "@inquirer/prompts";
import { getToken } from "./config.js";
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

export async function fetchVaultWrap(): Promise<VaultWrap> {
  const token = getToken();
  if (!token) {
    fail("Not logged in. Run envpull login first.");
  }

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
  try {
    const cached = await getMasterKey();
    if (cached) {
      return cached;
    }
  } catch (error) {
    fail(errorMessage(error, "Touch ID unlock failed"));
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
