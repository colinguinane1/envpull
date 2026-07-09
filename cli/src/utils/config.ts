import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const envpullDir = path.join(os.homedir(), ".envpull");

const configPath = path.join(envpullDir, "config.json");

export function saveConfig(data: object) {
  if (!fs.existsSync(envpullDir)) {
    fs.mkdirSync(envpullDir);
  }

  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

export function getConfig() {
  if (!fs.existsSync(configPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function deleteConfig() {
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }
}
