import { dateKeyToUtc } from "./dates";
import { FRUITS, type FruitValue } from "./fruits";

export const TIMELINE_PAGE_SIZE = 12;

export type TimelineSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type TimelineFilters = {
  query: string;
  fruit: FruitValue | "";
  month: string;
  page: number;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isFruit(value: string | undefined): value is FruitValue {
  return FRUITS.includes(value as FruitValue);
}

function isMonth(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return false;
  const month = Number(value.slice(5));
  return month >= 1 && month <= 12;
}

export function parseTimelineFilters(
  searchParams: TimelineSearchParams,
): TimelineFilters {
  const query = firstValue(searchParams.q)?.trim().slice(0, 120) ?? "";
  const fruit = firstValue(searchParams.fruit);
  const month = firstValue(searchParams.month);
  const page = Number.parseInt(firstValue(searchParams.page) ?? "1", 10);

  return {
    query,
    fruit: isFruit(fruit) ? fruit : "",
    month: isMonth(month) ? month : "",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function monthBounds(month: string) {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const nextYear = monthNumber === 12 ? year + 1 : year;

  return {
    start: dateKeyToUtc(month + "-01"),
    end: dateKeyToUtc(
      `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
    ),
  };
}

export function hasTimelineFilters(filters: TimelineFilters) {
  return Boolean(filters.query || filters.fruit || filters.month);
}

export function timelineHref(filters: TimelineFilters, page: number) {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.fruit) params.set("fruit", filters.fruit);
  if (filters.month) params.set("month", filters.month);
  if (page > 1) params.set("page", String(page));

  const queryString = params.toString();
  return queryString ? `/reflections/timeline?${queryString}` : "/reflections/timeline";
}
