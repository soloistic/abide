import { describe, expect, it } from "vitest";
import {
  countFruitTrends,
  groupReflectionsByMonth,
  selectGrowthHighlights,
} from "./reflection-insights";

describe("reflection insights", () => {
  it("counts fruit appearances and keeps equal counts in fruit order", () => {
    expect(
      countFruitTrends([
        { fruits: ["JOY", "PEACE"] },
        { fruits: ["LOVE", "JOY"] },
      ]),
    ).toEqual([
      { fruit: "JOY", count: 2 },
      { fruit: "LOVE", count: 1 },
      { fruit: "PEACE", count: 1 },
    ]);
  });

  it("groups ordered reflections by calendar month", () => {
    const reflections = [
      {
        id: "june-2",
        reflectionDate: new Date("2026-06-20T00:00:00.000Z"),
        fruits: ["JOY"] as const,
      },
      {
        id: "june-1",
        reflectionDate: new Date("2026-06-02T00:00:00.000Z"),
        fruits: ["LOVE"] as const,
      },
      {
        id: "may",
        reflectionDate: new Date("2026-05-30T00:00:00.000Z"),
        fruits: ["PEACE"] as const,
      },
    ];

    const grouped = groupReflectionsByMonth(
      reflections.map((reflection) => ({
        ...reflection,
        fruits: [...reflection.fruits],
      })),
    );

    expect(grouped.map(({ key, label }) => ({ key, label }))).toEqual([
      { key: "2026-06", label: "June 2026" },
      { key: "2026-05", label: "May 2026" },
    ]);
    expect(grouped[0].reflections.map(({ id }) => id)).toEqual([
      "june-2",
      "june-1",
    ]);
  });

  it("selects recent reflections for fruits that keep appearing", () => {
    const reflections = [
      {
        id: "latest",
        reflectionDate: new Date("2026-06-20T00:00:00.000Z"),
        fruits: ["JOY", "PEACE"] as const,
        lessonLearned: "Joy can coexist with a difficult day.",
      },
      {
        id: "middle",
        reflectionDate: new Date("2026-06-19T00:00:00.000Z"),
        fruits: ["JOY", "LOVE"] as const,
        lessonLearned: "Love looks like patient attention.",
      },
      {
        id: "earliest",
        reflectionDate: new Date("2026-06-18T00:00:00.000Z"),
        fruits: ["LOVE"] as const,
        lessonLearned: "Small acts can be faithful.",
      },
    ].map((reflection) => ({
      ...reflection,
      fruits: [...reflection.fruits],
    }));

    const highlights = selectGrowthHighlights(reflections);

    expect(
      highlights.map(({ fruit, count, reflection }) => ({
        fruit,
        count,
        reflectionId: reflection.id,
      })),
    ).toEqual([
      { fruit: "LOVE", count: 2, reflectionId: "middle" },
      { fruit: "JOY", count: 2, reflectionId: "latest" },
    ]);
  });

  it("waits for enough history before calling out growth", () => {
    expect(
      selectGrowthHighlights([
        {
          id: "one",
          reflectionDate: new Date("2026-06-20T00:00:00.000Z"),
          fruits: ["JOY"],
          lessonLearned: "A lesson",
        },
        {
          id: "two",
          reflectionDate: new Date("2026-06-19T00:00:00.000Z"),
          fruits: ["JOY"],
          lessonLearned: "Another lesson",
        },
      ]),
    ).toEqual([]);
  });
});
