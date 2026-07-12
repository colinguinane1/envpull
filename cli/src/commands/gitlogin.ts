
import open from "open";
import { getToken } from "../utils/config.js";
import axios from "axios";

export async function gitLogin() {
  const token = getToken();
  if (!token) {
    console.error("No token found. Please log in first.")
    return
  }

  const response = await axios.get("http://localhost:3000/auth/github/start", {
    headers: { Authorization: `Bearer ${token}` },
  });
   await open(response.data.url);
}
