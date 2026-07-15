import axios from "axios";
import { getToken } from "../utils/config.js";
import { getApiBase, authHeaders } from "../utils/api.js";
import { fail, errorMessage } from "../utils/fail.js";

export async function whoAmICommand() {
  try {
    const token = getToken();

    if (!token) {
      fail("Not logged in.");
    }

    const response = await axios.get(`${getApiBase()}/auth/me`, {
      headers: authHeaders(token),
    });

    console.log(response.data);
  } catch (error) {
    fail(errorMessage(error, "whoami failed"));
  }
}
