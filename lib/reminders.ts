import { getAppTimeZone, getDateKey } from "./dates";

export const DAILY_REMINDER_HOUR = 20;

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
  return getLocalHour(date, timeZone) === DAILY_REMINDER_HOUR;
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
