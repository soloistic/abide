import { getAppTimeZone, getDateKey } from "./dates";

// Vercel's Hobby plan allows one daily cron job, so production schedules a
// single run at 19:00 UTC. That lands on 8:00 pm during British Summer Time
// and 7:00 pm during GMT. Both local hours are accepted so a run delayed
// within its scheduled hour still delivers; recording the reminder date
// afterwards keeps any second matching run from sending twice.
export const DAILY_REMINDER_HOURS: readonly number[] = [19, 20];

export type DailyReminderPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
};

export function getLocalHour(
  date = new Date(),
  timeZone = getAppTimeZone(),
) {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .find((part) => part.type === "hour")?.value;

  return Number(hour);
}

export function isDailyReminderHour(
  date = new Date(),
  timeZone = getAppTimeZone(),
) {
  return DAILY_REMINDER_HOURS.includes(getLocalHour(date, timeZone));
}

export function getDailyReminderDateKey(
  date = new Date(),
  timeZone = getAppTimeZone(),
) {
  return getDateKey(date, timeZone);
}

export function buildDailyReminderPayload(): DailyReminderPayload {
  return {
    title: "A quiet space to reflect",
    body: "Today’s reflection is still open. Whenever you are ready, there is space to notice what God is doing.",
    url: "/reflections/new",
    tag: "abide-daily-reminder",
  };
}

export function buildTestReminderPayload(): DailyReminderPayload {
  return {
    title: "Your evening reminder is working",
    body: "There is space to reflect whenever you are ready. You can turn this reminder off at any time.",
    url: "/settings",
    tag: "abide-daily-reminder-test",
  };
}
