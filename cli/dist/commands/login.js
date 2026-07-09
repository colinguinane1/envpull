import { input, password } from "@inquirer/prompts";
import axios from "axios";
import { saveToken } from "../utils/config.js";
export async function loginCommand() {
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
//# sourceMappingURL=login.js.map