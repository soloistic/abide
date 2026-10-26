import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("pwa manifest", () => {
  it("meets installability requirements", () => {
    const value = manifest();

    expect(value.id).toBe("/");
    expect(value.name).toBe("Abide");
    expect(value.short_name).toBe("Abide");
    expect(value.lang).toBe("en-GB");
    expect(value.start_url).toBe("/");
    expect(value.scope).toBe("/");
    expect(value.display).toBe("standalone");

    const sizes = value.icons?.map((icon) => icon.sizes) ?? [];
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(
      value.icons?.some((icon) => icon.purpose === "maskable"),
    ).toBe(true);
  });

  it("offers shortcuts into the journal", () => {
    const value = manifest();
    const shortcutUrls = value.shortcuts?.map((shortcut) => shortcut.url) ?? [];

    expect(shortcutUrls).toContain("/reflections/new");
    expect(shortcutUrls).toContain("/reflections/timeline");
    expect(shortcutUrls).toContain("/prayers");
  });
});
