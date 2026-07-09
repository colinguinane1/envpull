import { getConfig } from "../utils/config.js";

export function statusCommand() {
  const config = getConfig();

  if (!config) {
    console.log("Not logged in!");
    return;
  }

  console.log(`Logged in as ${config.email}`);
}
