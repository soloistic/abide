import { describe, expect, it } from "vitest";
import {
  buildTestimonyDraft,
  MAX_TESTIMONY_SOURCES,
  testimonyDraftSchema,
  testimonySelectionSchema,
  type TestimonySource,
} from "./testimony";

function source(overrides: Partial<TestimonySource> = {}): TestimonySource {
  return {
    id: "reflection-1",
    reflectionDate: new Date("2026-06-10T00:00:00.000Z"),
    fruits: ["PEACE"],
    scriptureRef: "Galatians 5:22-23",
    lessonLearned: "God is teaching me to listen before I answer.",
    prayerNote: null,
    ...overrides,
  };
}

describe("buildTestimonyDraft", () => {
  it("orders moments from oldest to newest", () => {
    const newer = source({
      id: "newer",
      reflectionDate: new Date("2026-08-01T00:00:00.000Z"),
      lessonLearned: "A later lesson.",
    });
    const older = source({
      id: "older",
      reflectionDate: new Date("2026-05-01T00:00:00.000Z"),
      lessonLearned: "An earlier lesson.",
    });

    const draft = buildTestimonyDraft("", [newer, older]);

    expect(draft.body.indexOf("An earlier lesson.")).toBeLessThan(
      draft.body.indexOf("A later lesson."),
    );
  });

  it("weaves dates, lessons, scripture, and prayers into the scaffold", () => {
    const draft = buildTestimonyDraft("patience", [
      source({ prayerNote: "Help me carry that peace." }),
    ]);

    expect(draft.title).toBe("patience");
    expect(draft.body).toContain("10 June 2026");
    expect(draft.body).toContain(
      "God is teaching me to listen before I answer.",
    );
    expect(draft.body).toContain("Galatians 5:22-23");
    expect(draft.body).toContain("Help me carry that peace.");
    expect(draft.body).toContain("Peace");
  });

  it("uses a gentle default title when no theme is given", () => {
    const draft = buildTestimonyDraft("   ", [source()]);

    expect(draft.title).toBe("A testimony in progress");
  });

  it("leaves out scripture and prayer lines when they are absent", () => {
    const draft = buildTestimonyDraft("", [
      source({ scriptureRef: null, prayerNote: "  " }),
    ]);

    expect(draft.body).not.toContain("Rooted in");
    expect(draft.body).not.toContain("I had prayed");
    expect(draft.body).not.toContain("null");
  });

  it("invites the user to rewrite the scaffold in their own words", () => {
    const draft = buildTestimonyDraft("", [source()]);

    expect(draft.body).toContain("in your own words");
  });
});

describe("testimonySelectionSchema", () => {
  it("requires at least one reflection", () => {
    const result = testimonySelectionSchema.safeParse({
      theme: "",
      reflectionIds: [],
    });

    expect(result.success).toBe(false);
  });

  it("keeps the set small", () => {
    const result = testimonySelectionSchema.safeParse({
      theme: "",
      reflectionIds: Array.from(
        { length: MAX_TESTIMONY_SOURCES + 1 },
        (_, index) => `reflection-${index}`,
      ),
    });

    expect(result.success).toBe(false);
  });

  it("accepts a theme with a small set of reflections", () => {
    const result = testimonySelectionSchema.safeParse({
      theme: "peace",
      reflectionIds: ["a", "b"],
    });

    expect(result.success).toBe(true);
  });
});

describe("testimonyDraftSchema", () => {
  it("requires a title and body", () => {
    expect(
      testimonyDraftSchema.safeParse({ title: "", body: "Some words." })
        .success,
    ).toBe(false);
    expect(
      testimonyDraftSchema.safeParse({ title: "Story", body: "   " }).success,
    ).toBe(false);
    expect(
      testimonyDraftSchema.safeParse({ title: "Story", body: "Some words." })
        .success,
    ).toBe(true);
  });
});
