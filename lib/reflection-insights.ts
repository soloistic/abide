import { FRUITS, type FruitValue } from "./fruits";

type ReflectionSummary = {
  reflectionDate: Date;
  fruits: FruitValue[];
};

export type FruitTrend = {
  fruit: FruitValue;
  count: number;
};

export type ReflectionMonth<T extends ReflectionSummary> = {
  key: string;
  label: string;
  reflections: T[];
};

type GrowthReflection = ReflectionSummary & {
  id: string;
  lessonLearned: string;
};

export type GrowthHighlight<T extends GrowthReflection> = {
  fruit: FruitValue;
  count: number;
  reflection: T;
};

export function countFruitTrends(
  reflections: Pick<ReflectionSummary, "fruits">[],
): FruitTrend[] {
  const counts = new Map<FruitValue, number>(
    FRUITS.map((fruit) => [fruit, 0]),
  );

  for (const reflection of reflections) {
    for (const fruit of reflection.fruits) {
      counts.set(fruit, (counts.get(fruit) ?? 0) + 1);
    }
  }

  return FRUITS.map((fruit) => ({
    fruit,
    count: counts.get(fruit) ?? 0,
  }))
    .filter((trend) => trend.count > 0)
    .sort(
      (a, b) =>
        b.count - a.count ||
        FRUITS.indexOf(a.fruit) - FRUITS.indexOf(b.fruit),
    );
}

export function groupReflectionsByMonth<T extends ReflectionSummary>(
  reflections: T[],
): ReflectionMonth<T>[] {
  const months = new Map<string, ReflectionMonth<T>>();

  for (const reflection of reflections) {
    const key = reflection.reflectionDate.toISOString().slice(0, 7);
    const existing = months.get(key);

    if (existing) {
      existing.reflections.push(reflection);
      continue;
    }

    months.set(key, {
      key,
      label: new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        month: "long",
        year: "numeric",
      }).format(reflection.reflectionDate),
      reflections: [reflection],
    });
  }

  return [...months.values()];
}

export function selectGrowthHighlights<T extends GrowthReflection>(
  reflections: T[],
  limit = 2,
): GrowthHighlight<T>[] {
  if (reflections.length < 3 || limit < 1) return [];

  const repeatedFruits = countFruitTrends(reflections).filter(
    ({ count }) => count >= 2,
  );
  const selectedReflectionIds = new Set<string>();
  const highlights: GrowthHighlight<T>[] = [];

  for (const trend of repeatedFruits) {
    const reflection = reflections.find(
      (entry) =>
        entry.fruits.includes(trend.fruit) &&
        !selectedReflectionIds.has(entry.id),
    );

    if (!reflection) continue;

    highlights.push({ ...trend, reflection });
    selectedReflectionIds.add(reflection.id);

    if (highlights.length === limit) break;
  }

  return highlights;
}
