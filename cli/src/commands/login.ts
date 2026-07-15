import { confirm, input, password } from "@inquirer/prompts";
import axios from "axios";
import { getToken, removeToken, saveToken } from "../utils/config.js";
import chalk from "chalk";
import { getApiBase, authHeaders } from "../utils/api.js";
import { createVault, unlockWithPassword } from "../crypto/vault.js";
import { clearMasterKey, setMasterKey } from "../utils/session.js";
import { fetchVaultWrap } from "../utils/unlock.js";
import { errorMessage, fail } from "../utils/fail.js";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isAxiosStatus(error: unknown, status: number): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === status
  );
}

async function promptPasswordConfirmed(
  message = "Password:",
): Promise<string> {
  const pwd = await password({ message });
  const again = await password({ message: "Confirm password:" });
  if (pwd !== again) {
    fail("Passwords do not match");
  }
  return pwd;
}

async function signupFlow(email: string, pwd: string) {
  const { masterKey, vault } = await createVault(pwd);

  try {
    const response = await axios.post(`${getApiBase()}/auth/signup`, {
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

    const saved = await confirm({
      message: "I have saved this recovery key somewhere safe",
      default: false,
    });

    if (!saved) {
      console.log(
        chalk.yellow(
          "Write it down now — you will not see it again. Continuing anyway.",
        ),
      );
    }

    console.log("✔ Logged in successfully (vault unlocked until logout)");
  } catch (error) {
    fail(errorMessage(error, "Signup failed"));
  }
}

export async function loginCommand() {
  const existing = getToken();
  if (existing) {
    try {
      await axios.get(`${getApiBase()}/auth/me`, {
        headers: authHeaders(existing),
        validateStatus: (status) => status >= 200 && status < 300,
      });
      console.log("Already logged in. Use envpull whoami for more info.");
      process.exit(0);
    } catch {
      removeToken();
      await clearMasterKey();
    }
  }

  const email = normalizeEmail(
    await input({
      message: "Email:",
    }),
  );

  if (!email) {
    fail("Email is required");
  }

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
    if (!isAxiosStatus(error, 401)) {
      fail(errorMessage(error, "Login failed"));
    }
  }

  const create = await confirm({
    message: "No account for this email (or wrong password). Create a new account?",
    default: false,
  });

  if (!create) {
    fail("Login cancelled");
  }

  const confirmedPwd = await promptPasswordConfirmed("Choose a password:");
  await signupFlow(email, confirmedPwd);
}
