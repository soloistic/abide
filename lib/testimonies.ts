import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function getTestimonyDrafts() {
  await connection();
  return prisma.testimonyDraft.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTestimonyDraft(id: string) {
  await connection();
  return prisma.testimonyDraft.findUnique({
    where: { id },
  });
}

export async function getSelectableReflections(limit = 30) {
  await connection();
  return prisma.fruitReflection.findMany({
    orderBy: { reflectionDate: "desc" },
    take: limit,
    select: {
      id: true,
      reflectionDate: true,
      fruits: true,
      lessonLearned: true,
    },
  });
}

export async function getTestimonySources(ids: string[]) {
  if (!ids.length) return [];

  await connection();
  const reflections = await prisma.fruitReflection.findMany({
    where: { id: { in: ids } },
  });
  const order = new Map(ids.map((id, index) => [id, index]));

  return reflections.sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );
}
