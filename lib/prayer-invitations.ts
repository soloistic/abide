export const PRAYER_REVISIT_AFTER_DAYS = 7;

export type PrayerEntry = {
  id: string;
  reflectionDate: Date;
  prayerNote: string;
};

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function ageInDays(from: Date, now: Date) {
  return Math.floor((startOfUtcDay(now) - startOfUtcDay(from)) / 86_400_000);
}

/**
 * Choose a gentle invitation to revisit an older prayer.
 *
 * The oldest prayer that has been carried for at least `minAgeDays` is
 * returned, so the nudge points backwards without ranking, scoring, or
 * pressuring the reader. Returns null when there is nothing old enough to
 * revisit.
 */
export function selectPrayerInvitation<T extends PrayerEntry>(
  prayers: T[],
  now = new Date(),
  minAgeDays = PRAYER_REVISIT_AFTER_DAYS,
): T | null {
  let invitation: T | null = null;

  for (const prayer of prayers) {
    if (ageInDays(prayer.reflectionDate, now) < minAgeDays) continue;
    if (
      !invitation ||
      prayer.reflectionDate.getTime() < invitation.reflectionDate.getTime()
    ) {
      invitation = prayer;
    }
  }

  return invitation;
}
