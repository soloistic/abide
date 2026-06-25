import { afterEach, describe, expect, it, vi } from "vitest";
import {
  constantTimeEqual,
  createSessionToken,
  verifySessionToken,
} from "./session";

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
