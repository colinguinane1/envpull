import { input, password } from "@inquirer/prompts";
import axios from "axios";
import { getToken, saveToken } from "../utils/config.js";
import chalk from "chalk";
import { getApiBase } from "../utils/api.js";
import { createVault, unlockWithPassword } from "../crypto/vault.js";
import { setMasterKey } from "../utils/session.js";
import { fetchVaultWrap } from "../utils/unlock.js";
import { errorMessage, fail } from "../utils/fail.js";

function isAxiosError(error: unknown): error is {
  response?: { status?: number; data?: { error?: string } };
} {
  return typeof error === "object" && error !== null && "response" in error;
}

export async function loginCommand() {
  const token = getToken();

  if (token) {
    console.log("Already logged in. Use envpull whoami for more info.");
    process.exit(0);
  }

  const email = await input({
    message: "Email:",
  });

  const pwd = await password({
    message: "Password:",
  });

  try {
    const response = await axios.post(`${getApiBase()}/auth/login`, {
      email,
      password: pwd,
    });

    saveToken(response.data.token);

    const wrap = await fetchVaultWrap();
    const masterKey = await unlockWithPassword(wrap, pwd);
    await setMasterKey(masterKey);

    console.log("✔ Logged in successfully (vault unlocked until logout)");
    return;
  } catch (error) {
    if (
      !isAxiosError(error) ||
      error.response?.status !== 400 ||
      error.response?.data?.error !== "Vault payload required for signup"
    ) {
      fail(errorMessage(error, "Login failed"));
    }
  }

  const { masterKey, vault } = await createVault(pwd);

  try {
    const response = await axios.post(`${getApiBase()}/auth/login`, {
      email,
      password: pwd,
      recoveryKey: vault.recoveryKey,
      kdfParams: vault.kdfParams,
      passwordWrapSalt: vault.passwordWrapSalt,
      wrappedMkByPassword: vault.wrappedMkByPassword,
      recoveryWrapSalt: vault.recoveryWrapSalt,
      wrappedMkByRecovery: vault.wrappedMkByRecovery,
    });

    saveToken(response.data.token);
    await setMasterKey(masterKey);

    console.log(
      chalk.bold.yellow(
        "Account created! Save this recovery key in case you forget your password.",
      ),
    );

    console.log(
      chalk.red(
        "⚠ envpull cannot restore lost data if you forget your password and lose this recovery key.",
      ),
    );

    console.log(chalk.bold.green(vault.recoveryKey));
    console.log("✔ Logged in successfully (vault unlocked until logout)");
  } catch (error) {
    fail(errorMessage(error, "Signup failed"));
  }
}
