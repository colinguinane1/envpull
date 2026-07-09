import { input, password } from "@inquirer/prompts";
import axios from "axios";
import { getToken, saveToken } from "../utils/config.js";

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

  const response = await axios.post("http://localhost:3000/auth/login", {
    email,
    password: pwd,
  });

  saveToken(response.data.token);

  console.log("✔ Logged in successfully");
}
