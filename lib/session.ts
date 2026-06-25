export const SESSION_COOKIE_NAME = "abide-session";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;
const textEncoder = new TextEncoder();

type AuthConfig = {
  username: string;
  password: string;
  secret: string;
};

type SessionPayload = {
  sub: string;
  iat: number;
  exp: number;
};

function base64UrlEncode(value: string | Uint8Array) {
  const bytes =
    typeof value === "string" ? textEncoder.encode(value) : value;
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return atob(padded);
}

async function signingKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
}

async function sign(value: string, secret: string) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(secret),
    textEncoder.encode(value),
  );

  return base64UrlEncode(new Uint8Array(signature));
}

export function getAuthConfig(): AuthConfig | null {
  const username = process.env.ABIDE_AUTH_USERNAME?.trim();
  const password = process.env.ABIDE_AUTH_PASSWORD;
  const secret = process.env.ABIDE_SESSION_SECRET;

  if (!username || !password || !secret) return null;

  return { username, password, secret };
}

export function authIsConfigured() {
  return getAuthConfig() !== null;
}

export function constantTimeEqual(left: string, right: string) {
  const maxLength = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;

  for (let index = 0; index < maxLength; index += 1) {
    difference |=
      (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return difference === 0;
}

export async function createSessionToken(username: string) {
  const config = getAuthConfig();

  if (!config) {
    throw new Error("Authentication is not configured.");
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: username,
    iat: issuedAt,
    exp: issuedAt + SESSION_DURATION_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(encodedPayload, config.secret);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined) {
  const config = getAuthConfig();

  if (!config || !token) return false;

  const [encodedPayload, signature, extra] = token.split(".");

  if (!encodedPayload || !signature || extra) return false;

  const expectedSignature = await sign(encodedPayload, config.secret);

  if (!constantTimeEqual(signature, expectedSignature)) return false;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);

    return payload.sub === config.username && payload.exp > now;
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  maxAge: SESSION_DURATION_SECONDS,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
