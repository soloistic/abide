const DEFAULT_TIME_ZONE = "UTC";

export function getAppTimeZone() {
  return process.env.APP_TIME_ZONE || DEFAULT_TIME_ZONE;
}

export function getDateKey(date = new Date(), timeZone = getAppTimeZone()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function dateKeyToUtc(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function formatReflectionDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(date);
}
