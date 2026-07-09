import { getToken, removeToken } from "../utils/config.js";

export function logoutCommand() {
  const token = getToken();
  if (token) {
    removeToken();
    console.log("User logged out");
  } else {
    console.log("No user is logged in.");
  }
}
