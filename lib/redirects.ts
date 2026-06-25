const FALLBACK_PATH = "/";

function decodePath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function safeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return FALLBACK_PATH;
  if (value.startsWith("/login")) return FALLBACK_PATH;

  let decoded = value;

  for (let index = 0; index < 2; index += 1) {
    if (decoded.includes("\\") || decoded.startsWith("//")) {
      return FALLBACK_PATH;
    }

    const nextDecoded = decodePath(decoded);

    if (!nextDecoded || nextDecoded === decoded) break;

    decoded = nextDecoded;
  }

  if (decoded.includes("\\") || decoded.startsWith("//")) {
    return FALLBACK_PATH;
  }

  return value;
}
