import { afterEach, describe, expect, it, vi } from "vitest";
import {
  constantTimeEqual,
  createSessionToken,
  verifySessionToken,
} from "./session";
import { safeNextPath } from "./redirects";

const env = process.env;

describe("auth sessions", () => {
  afterEach(() => {
    vi.useRealTimers();
    process.env = env;
  });

  it("accepts an untampered session for the configured user", async () => {
    process.env = {
      ...env,
      ABIDE_AUTH_PASSWORD: "quiet-password",
      ABIDE_AUTH_USERNAME: "solo",
      ABIDE_SESSION_SECRET: "test-secret-with-enough-entropy",
    };

    const token = await createSessionToken("solo");

    await expect(verifySessionToken(token)).resolves.toBe(true);
  });

  it("rejects tampered or expired sessions", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-25T12:00:00Z"));
    process.env = {
      ...env,
      ABIDE_AUTH_PASSWORD: "quiet-password",
      ABIDE_AUTH_USERNAME: "solo",
      ABIDE_SESSION_SECRET: "test-secret-with-enough-entropy",
    };

    const token = await createSessionToken("solo");
    const tamperedToken = `${token.slice(0, -1)}x`;

    await expect(verifySessionToken(tamperedToken)).resolves.toBe(false);

    vi.setSystemTime(new Date("2026-07-26T12:00:01Z"));
    await expect(verifySessionToken(token)).resolves.toBe(false);
  });

  it("compares credentials without short-circuiting on length", () => {
    expect(constantTimeEqual("solo", "solo")).toBe(true);
    expect(constantTimeEqual("solo", "sol")).toBe(false);
    expect(constantTimeEqual("solo", "else")).toBe(false);
  });
});

describe("login redirects", () => {
  it("allows local paths and rejects external or login destinations", () => {
    expect(safeNextPath("/")).toBe("/");
    expect(safeNextPath("/reflections/new?q=peace")).toBe(
      "/reflections/new?q=peace",
    );
    expect(safeNextPath("https://example.com")).toBe("/");
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("/login?next=/reflections/new")).toBe("/");
  });

  it("rejects backslash and encoded separator redirects", () => {
    expect(safeNextPath("/\\evil.example")).toBe("/");
    expect(safeNextPath("/%5Cevil.example")).toBe("/");
    expect(safeNextPath("/%2Fevil.example")).toBe("/");
    expect(safeNextPath("/%255Cevil.example")).toBe("/");
  });
});
