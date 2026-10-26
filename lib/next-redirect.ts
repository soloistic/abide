// A Server Action that calls redirect() rejects with a NEXT_REDIRECT digest
// error. The router usually performs the navigation itself, but a plain
// try/catch in calling code would swallow it; detect it so callers can finish
// the redirect with the router instead of treating it as a failure.
export function isNextRedirect(error: unknown) {
  if (typeof error !== "object" || error === null) return false;

  const digest = (error as { digest?: unknown }).digest;

  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}
