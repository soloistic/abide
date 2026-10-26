import { describe, expect, it } from "vitest";
import {
  buildDailyReminderPayload,
  buildTestReminderPayload,
  DAILY_REMINDER_HOURS,
  getDailyReminderDateKey,
  getLocalHour,
  isDailyReminderHour,
} from "./reminders";

describe("daily reminder timing", () => {
  it("sends during the scheduled evening hours", () => {
    // Summer: 19:00 UTC is 8:00 pm in London (BST).
    expect(
      getLocalHour(new Date("2026-06-20T19:00:00.000Z"), "Europe/London"),
    ).toBe(20);
    expect(
      isDailyReminderHour(
        new Date("2026-06-20T19:00:00.000Z"),
        "Europe/London",
      ),
    ).toBe(true);
    // Winter: 19:00 UTC is 7:00 pm in London (GMT).
    expect(
      getLocalHour(new Date("2026-12-20T19:00:00.000Z"), "Europe/London"),
    ).toBe(19);
    expect(
      isDailyReminderHour(
        new Date("2026-12-20T19:00:00.000Z"),
        "Europe/London",
      ),
    ).toBe(true);
    // A run delayed to the next local hour is still accepted; the reminder
    // date recorded afterwards keeps it from sending twice.
    expect(
      isDailyReminderHour(
        new Date("2026-12-20T20:00:00.000Z"),
        "Europe/London",
      ),
    ).toBe(true);
  });

  it("does not send at other hours", () => {
    expect(
      isDailyReminderHour(
        new Date("2026-06-20T17:00:00.000Z"),
        "Europe/London",
      ),
    ).toBe(false);
    expect(
      isDailyReminderHour(
        new Date("2026-06-20T20:00:00.000Z"),
        "Europe/London",
      ),
    ).toBe(false);
    expect(
      isDailyReminderHour(
        new Date("2026-12-20T18:00:00.000Z"),
        "Europe/London",
      ),
    ).toBe(false);
    expect(DAILY_REMINDER_HOURS).toEqual([19, 20]);
  });

  it("uses the local calendar date for deduplication", () => {
    expect(
      getDailyReminderDateKey(
        new Date("2026-06-20T23:30:00.000Z"),
        "Europe/London",
      ),
    ).toBe("2026-06-21");
  });

  it("builds calm payloads that open the journal", () => {
    const daily = buildDailyReminderPayload();
    const test = buildTestReminderPayload();

    expect(daily.url).toBe("/reflections/new");
    expect(daily.tag).toBe("abide-daily-reminder");
    expect(daily.title).not.toMatch(/streak|score|missed/i);
    expect(test.url).toBe("/settings");
    expect(test.tag).toBe("abide-daily-reminder-test");
  });
});
