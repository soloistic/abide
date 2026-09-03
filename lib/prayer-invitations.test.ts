import { describe, expect, it } from "vitest";
import {
  PRAYER_REVISIT_AFTER_DAYS,
  selectPrayerInvitation,
} from "./prayer-invitations";

function entry(id: string, reflectionDate: string) {
  return {
    id,
    reflectionDate: new Date(reflectionDate),
    prayerNote: `Prayer ${id}`,
  };
}

describe("selectPrayerInvitation", () => {
  const now = new Date("2026-09-03T12:00:00.000Z");

  it("returns null when no prayer is old enough to revisit", () => {
    const prayers = [
      entry("recent", "2026-09-01T00:00:00.000Z"),
      entry("today", "2026-09-03T00:00:00.000Z"),
    ];

    expect(selectPrayerInvitation(prayers, now)).toBeNull();
  });

  it("returns the oldest prayer carried beyond the waiting period", () => {
    const prayers = [
      entry("recent", "2026-09-01T00:00:00.000Z"),
      entry("older", "2026-08-10T00:00:00.000Z"),
      entry("oldest", "2026-07-20T00:00:00.000Z"),
    ];

    expect(selectPrayerInvitation(prayers, now)?.id).toBe("oldest");
  });

  it("treats the waiting period as whole calendar days", () => {
    const exactlyDue = [entry("due", "2026-08-27T00:00:00.000Z")];

    expect(PRAYER_REVISIT_AFTER_DAYS).toBe(7);
    expect(selectPrayerInvitation(exactlyDue, now)?.id).toBe("due");
  });

  it("returns null for an empty prayer list", () => {
    expect(selectPrayerInvitation([], now)).toBeNull();
  });
});
