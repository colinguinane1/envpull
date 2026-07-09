import { input, password } from "@inquirer/prompts";
import { saveConfig } from "../utils/config.js";

export async function loginCommand() {
  const email = await input({
    message: "Email:",
  });

  await password({
    message: "Password:",
  });

  saveConfig({ email, token: "fake-token" });
}
