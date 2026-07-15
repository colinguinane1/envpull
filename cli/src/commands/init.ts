import axios from "axios";
import path from "path";
import { input } from "@inquirer/prompts";
import { getToken } from "../utils/config.js";
import { getApiBase, authHeaders } from "../utils/api.js";
import {
  getProjectConfig,
  saveProjectConfig,
  slugify,
} from "../utils/project.js";
import { fail, errorMessage } from "../utils/fail.js";

export async function initCommand() {
  try {
    const token = getToken();
    if (!token) {
      fail("Not logged in. Run envpull login first.");
    }

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
