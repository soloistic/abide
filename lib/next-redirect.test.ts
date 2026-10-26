import { describe, expect, it } from "vitest";
import { isNextRedirect } from "./next-redirect";

describe("isNextRedirect", () => {
  it("recognises the digest error a redirecting Server Action rejects with", () => {
    expect(
      isNextRedirect(
        Object.assign(new Error("NEXT_REDIRECT"), {
          digest: "NEXT_REDIRECT;replace;/login;307;",
        }),
      ),
    ).toBe(true);
  });

  it("ignores ordinary failures and non-error values", () => {
    expect(isNextRedirect(new Error("Network failed"))).toBe(false);
    expect(isNextRedirect({ digest: "OTHER_DIGEST" })).toBe(false);
    expect(isNextRedirect(null)).toBe(false);
    expect(isNextRedirect("NEXT_REDIRECT;replace;/login;307;")).toBe(false);
  });
});
