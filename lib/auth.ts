import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/session";

export {
  authIsConfigured,
  constantTimeEqual,
  createSessionToken,
  getAuthConfig,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/session";

export async function isAuthenticated() {
  const cookieStore = await cookies();

  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function requireAuthenticatedUser() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}
