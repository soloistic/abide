import { describe, expect, it } from "vitest";
import {
  hasTimelineFilters,
  monthBounds,
  parseTimelineFilters,
  timelineHref,
} from "./timeline-filters";

describe("timeline filters", () => {
  it("accepts gentle search, fruit, month, and page filters", () => {
    expect(
      parseTimelineFilters({
        q: "  Romans 12  ",
        fruit: "PEACE",
        month: "2026-06",
        page: "3",
      }),
    ).toEqual({
      query: "Romans 12",
      fruit: "PEACE",
      month: "2026-06",
      page: 3,
    });
  });

  it("falls back from unknown filter values", () => {
    expect(
      parseTimelineFilters({
        q: ["quiet", "ignored"],
        fruit: "COURAGE",
        month: "2026-13",
        page: "-2",
      }),
    ).toEqual({
      query: "quiet",
      fruit: "",
      month: "",
      page: 1,
    });
  });

  it("builds UTC month bounds for calendar-date queries", () => {
    expect(monthBounds("2026-12")).toEqual({
      start: new Date("2026-12-01T00:00:00.000Z"),
      end: new Date("2027-01-01T00:00:00.000Z"),
    });
  });

  it("preserves active filters in pagination links", () => {
    const filters = parseTimelineFilters({
      q: "peace",
      fruit: "JOY",
      month: "2026-06",
    });

    expect(hasTimelineFilters(filters)).toBe(true);
    expect(timelineHref(filters, 2)).toBe(
      "/reflections/timeline?q=peace&fruit=JOY&month=2026-06&page=2",
    );
    expect(timelineHref(filters, 1)).toBe(
      "/reflections/timeline?q=peace&fruit=JOY&month=2026-06",
    );
  });
});
