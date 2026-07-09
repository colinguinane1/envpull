import axios from "axios";
import { getToken } from "../utils/config.js";

export async function whoAmICommand() {
  const token = getToken();

  if (!token) {
    console.log("Not logged in.");
    process.exit(1);
  }

  const response = await axios.get("http://localhost:3000/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(response.data);
}
