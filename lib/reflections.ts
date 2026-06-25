import { connection } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { dateKeyToUtc, getDateKey } from "@/lib/dates";
import { FRUITS, type FruitValue } from "@/lib/fruits";
import { prisma } from "@/lib/prisma";
import type { GrowthHighlight } from "@/lib/reflection-insights";
import { monthBounds, type TimelineFilters } from "@/lib/timeline-filters";

const timelineReflectionSelect = {
  id: true,
  reflectionDate: true,
  journalText: true,
  fruits: true,
  scriptureRef: true,
  lessonLearned: true,
} satisfies Prisma.FruitReflectionSelect;

type FruitTrendRow = {
  fruit: string;
  count: bigint | number;
};

type GrowthHighlightRow = {
  fruit: string;
  count: bigint | number;
  id: string;
  reflectionDate: Date;
  fruits: FruitValue[];
  lessonLearned: string;
};

function fruitOrder(fruit: FruitValue) {
  return FRUITS.indexOf(fruit);
}

function isFruitValue(value: string): value is FruitValue {
  return FRUITS.includes(value as FruitValue);
}

function toNumber(value: bigint | number) {
  return typeof value === "bigint" ? Number(value) : value;
}

function timelineWhere(filters: TimelineFilters): Prisma.FruitReflectionWhereInput {
  const and: Prisma.FruitReflectionWhereInput[] = [];

  if (filters.query) {
    and.push({
      OR: [
        { journalText: { contains: filters.query, mode: "insensitive" } },
        { lessonLearned: { contains: filters.query, mode: "insensitive" } },
        { scriptureRef: { contains: filters.query, mode: "insensitive" } },
        { prayerNote: { contains: filters.query, mode: "insensitive" } },
      ],
    });
  }

  if (filters.fruit) {
    and.push({ fruits: { has: filters.fruit } });
  }

  if (filters.month) {
    const { start, end } = monthBounds(filters.month);
    and.push({
      reflectionDate: {
        gte: start,
        lt: end,
      },
    });
  }

  return and.length ? { AND: and } : {};
}

export async function getTodayReflection() {
  await connection();
  return prisma.fruitReflection.findUnique({
    where: { reflectionDate: dateKeyToUtc(getDateKey()) },
  });
}

export async function getRecentReflections(limit = 6) {
  await connection();
  return prisma.fruitReflection.findMany({
    orderBy: { reflectionDate: "desc" },
    take: limit,
  });
}

export async function getAllReflections() {
  await connection();
  return prisma.fruitReflection.findMany({
    orderBy: { reflectionDate: "desc" },
  });
}

export async function getFruitTrends() {
  await connection();
  const rows = await prisma.$queryRaw<FruitTrendRow[]>`
    SELECT fruit.value::text AS fruit, COUNT(*) AS count
    FROM "FruitReflection"
    CROSS JOIN LATERAL unnest("FruitReflection"."fruits") AS fruit(value)
    GROUP BY fruit.value
  `;

  return rows
    .filter((row): row is FruitTrendRow & { fruit: FruitValue } =>
      isFruitValue(row.fruit),
    )
    .map((row) => ({
      fruit: row.fruit,
      count: toNumber(row.count),
    }))
    .sort((a, b) => b.count - a.count || fruitOrder(a.fruit) - fruitOrder(b.fruit));
}

export async function getGrowthHighlights(
  limit = 2,
): Promise<GrowthHighlight<GrowthHighlightRow>[]> {
  if (limit < 1) return [];

  await connection();
  const rows = await prisma.$queryRaw<GrowthHighlightRow[]>`
    WITH total_reflections AS (
      SELECT COUNT(*) AS count
      FROM "FruitReflection"
    ),
    fruit_counts AS (
      SELECT fruit.value AS fruit, COUNT(*) AS count
      FROM "FruitReflection"
      CROSS JOIN LATERAL unnest("FruitReflection"."fruits") AS fruit(value)
      GROUP BY fruit.value
      HAVING COUNT(*) >= 2
    ),
    fruit_reflections AS (
      SELECT
        fruit_counts.fruit::text AS fruit,
        fruit_counts.count AS count,
        reflection.id,
        reflection."reflectionDate",
        reflection.fruits,
        reflection."lessonLearned",
        ROW_NUMBER() OVER (
          PARTITION BY fruit_counts.fruit
          ORDER BY reflection."reflectionDate" DESC
        ) AS rank
      FROM fruit_counts
      JOIN "FruitReflection" AS reflection
        ON fruit_counts.fruit = ANY(reflection.fruits)
    )
    SELECT fruit, count, id, "reflectionDate", fruits, "lessonLearned"
    FROM fruit_reflections
    WHERE
      rank <= ${limit}
      AND (SELECT count FROM total_reflections) >= 3
  `;

  const candidates = rows
    .filter((row): row is GrowthHighlightRow & { fruit: FruitValue } =>
      isFruitValue(row.fruit),
    )
    .map((row) => ({
      fruit: row.fruit,
      count: toNumber(row.count),
      reflection: row,
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        fruitOrder(a.fruit) - fruitOrder(b.fruit) ||
        b.reflection.reflectionDate.getTime() -
          a.reflection.reflectionDate.getTime(),
    );
  const selectedReflectionIds = new Set<string>();
  const selectedFruits = new Set<FruitValue>();
  const highlights: GrowthHighlight<GrowthHighlightRow>[] = [];

  for (const candidate of candidates) {
    if (
      selectedFruits.has(candidate.fruit) ||
      selectedReflectionIds.has(candidate.reflection.id)
    ) {
      continue;
    }

    highlights.push(candidate);
    selectedFruits.add(candidate.fruit);
    selectedReflectionIds.add(candidate.reflection.id);

    if (highlights.length === limit) break;
  }

  return highlights;
}

export async function getTimelineReflections(
  filters: TimelineFilters,
  pageSize: number,
) {
  await connection();
  const where = timelineWhere(filters);
  const skip = (filters.page - 1) * pageSize;

  const [reflections, totalCount] = await Promise.all([
    prisma.fruitReflection.findMany({
      where,
      orderBy: { reflectionDate: "desc" },
      select: timelineReflectionSelect,
      take: pageSize,
      skip,
    }),
    prisma.fruitReflection.count({ where }),
  ]);

  return {
    reflections,
    totalCount,
    hasNextPage: skip + reflections.length < totalCount,
  };
}

export async function getReflection(id: string) {
  await connection();
  return prisma.fruitReflection.findUnique({
    where: { id },
  });
}
