import { describe, expect, it } from "vitest";
import {
  dateKeyToUtc,
  formatReflectionDate,
  getDateKey,
} from "./dates";

describe("reflection dates", () => {
  it("uses the selected calendar timezone instead of the UTC date", () => {
    const nearMidnight = new Date("2026-06-20T23:30:00.000Z");

    expect(getDateKey(nearMidnight, "Europe/London")).toBe("2026-06-21");
    expect(getDateKey(nearMidnight, "America/New_York")).toBe("2026-06-20");
  });

  it("stores a date key as UTC midnight", () => {
    expect(dateKeyToUtc("2026-06-21").toISOString()).toBe(
      "2026-06-21T00:00:00.000Z",
    );
  });

  it("formats database dates without shifting the calendar day", () => {
    expect(formatReflectionDate(new Date("2026-06-21T00:00:00.000Z"))).toBe(
      "21 June 2026",
    );
  });
});
