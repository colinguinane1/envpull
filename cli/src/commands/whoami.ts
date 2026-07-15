import axios from "axios";
import { getApiBase, authHeaders } from "../utils/api.js";
import { fail, errorMessage } from "../utils/fail.js";
import { requireAuth } from "../utils/auth.js";

export async function whoAmICommand() {
  try {
    const token = await requireAuth();

    const response = await axios.get(`${getApiBase()}/auth/me`, {
      headers: authHeaders(token),
    });

    console.log(response.data);
  } catch (error) {
    fail(errorMessage(error, "whoami failed"));
  }
}
