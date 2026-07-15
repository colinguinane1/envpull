import { getToken, removeToken } from "../utils/config.js";
import { clearMasterKey } from "../utils/session.js";

export async function logoutCommand() {
  const token = getToken();
  if (token) {
    removeToken();
    await clearMasterKey();
    console.log("User logged out");
  } else {
    await clearMasterKey();
    console.log("No user is logged in.");
  }
}
