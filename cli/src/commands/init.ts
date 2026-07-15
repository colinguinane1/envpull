import axios from "axios";
import path from "path";
import { input } from "@inquirer/prompts";
import { getApiBase, authHeaders } from "../utils/api.js";
import {
  getProjectConfig,
  saveProjectConfig,
  slugify,
} from "../utils/project.js";
import { fail, errorMessage } from "../utils/fail.js";
import { requireAuth } from "../utils/auth.js";

export async function initCommand() {
  try {
    const token = await requireAuth();

    const existing = getProjectConfig();
    if (existing) {
      console.log(
        `Project already initialized: ${existing.name} (${existing.slug})`,
      );
      process.exit(0);
    }

    const defaultName = path.basename(process.cwd());
    const name = await input({
      message: "Project name:",
      default: defaultName,
    });

    const slug = slugify(
      await input({
        message: "Project slug:",
        default: slugify(name),
      }),
    );

    const response = await axios.post(
      `${getApiBase()}/projects`,
      { name, slug },
      { headers: authHeaders(token) },
    );

    saveProjectConfig({ name, slug: response.data.slug });
    console.log(`✔ Initialized project "${name}" (${response.data.slug})`);
  } catch (error) {
    fail(errorMessage(error, "Init failed"));
  }
}
