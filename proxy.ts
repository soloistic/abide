import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth-proxy";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (pathname === "/login") {
    if (!authenticated) return NextResponse.next();

    return NextResponse.redirect(new URL("/", request.url));
  }

  if (authenticated) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  const redirectStatus =
    request.method === "GET" || request.method === "HEAD" ? 307 : 303;

  return NextResponse.redirect(loginUrl, redirectStatus);
}

export const config = {
  matcher: [
    // PWA plumbing (service worker, manifest, offline fallback) stays public
    // so installation and offline use never depend on a session cookie.
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
