import { cookies } from "next/headers";

export const ADMIN_COOKIE = "softcomputer_admin";

// the cookie holds a hash of the admin password, so it can't be guessed or made up.
// changing the password signs everyone out.
export async function adminCookieValue() {
  const password = process.env.ADMIN_LOG_PASSWORD || "";
  if (!password) return "";
  const data = new TextEncoder().encode("softcomputer-admin:" + password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function sameString(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function validCookie(value) {
  return sameString(value || "", await adminCookieValue());
}

// for server pages: is the person looking at this signed in?
export async function isAdmin() {
  const store = await cookies();
  return validCookie(store.get(ADMIN_COOKIE)?.value);
}

// for api routes: signed in, or a script sending the server-side token
export async function isAdminRequest(req, tokenEnv = "ADMIN_LOG_TOKEN") {
  const token = (process.env[tokenEnv] || "").trim();
  const sent = (req.headers.get("x-admin-token") || "").trim();
  if (token && sameString(sent, token)) return true;
  return validCookie(req.cookies?.get(ADMIN_COOKIE)?.value);
}
