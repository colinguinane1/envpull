import fs from "fs";
import path from "path";
import os from "os";

export type EnvpullConfig = {
  token?: string;
  apiUrl?: string;
  biometrics?: boolean;
};

const envpullDir = path.join(os.homedir(), ".envpull");
const configPath = path.join(envpullDir, "config.json");

function ensureDir() {
  if (!fs.existsSync(envpullDir)) {
    fs.mkdirSync(envpullDir, { mode: 0o700 });
  }
}

export function readConfig(): EnvpullConfig {
  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8")) as EnvpullConfig;
  } catch {
    return {};
  }
}

export function writeConfig(config: EnvpullConfig) {
  ensureDir();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", {
    mode: 0o600,
  });
}

export function updateConfig(patch: Partial<EnvpullConfig>) {
  const next = { ...readConfig(), ...patch };
  writeConfig(next);
  return next;
}

export function saveToken(token: string) {
  updateConfig({ token });
}

export function getToken(): string | null {
  return readConfig().token ?? null;
}

export function removeToken() {
  const config = readConfig();
  delete config.token;
  if (Object.keys(config).length === 0) {
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
    return;
  }
  writeConfig(config);
}

export function getStoredApiUrl(): string | null {
  return readConfig().apiUrl ?? null;
}

export function setApiUrl(apiUrl: string) {
  updateConfig({ apiUrl: apiUrl.replace(/\/$/, "") });
}

export function isBiometricsEnabled(): boolean {
  return readConfig().biometrics === true;
}

export function setBiometricsEnabled(enabled: boolean) {
  updateConfig({ biometrics: enabled });
}
