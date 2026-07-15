import fs from "fs";
import path from "path";

export type ProjectConfig = {
  slug: string;
  name: string;
};

const PROJECT_FILE = ".envpull.json";

export function getProjectConfig(cwd = process.cwd()): ProjectConfig | null {
  const configPath = path.join(cwd, PROJECT_FILE);
  if (!fs.existsSync(configPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(configPath, "utf8")) as ProjectConfig;
}

export function saveProjectConfig(config: ProjectConfig, cwd = process.cwd()) {
  const configPath = path.join(cwd, PROJECT_FILE);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
