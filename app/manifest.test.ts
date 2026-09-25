import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("pwa manifest", () => {
  it("meets installability requirements", () => {
    const value = manifest();

    expect(value.name).toBe("Abide");
    expect(value.short_name).toBe("Abide");
    expect(value.start_url).toBe("/");
    expect(value.display).toBe("standalone");

    const sizes = value.icons?.map((icon) => icon.sizes) ?? [];
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(
      value.icons?.some((icon) => icon.purpose === "maskable"),
    ).toBe(true);
  });
});
