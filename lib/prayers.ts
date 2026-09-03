import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function getPrayerEntries() {
  await connection();
  const reflections = await prisma.fruitReflection.findMany({
    where: {
      prayerNote: { not: null },
    },
    orderBy: { reflectionDate: "desc" },
    select: {
      id: true,
      reflectionDate: true,
      prayerNote: true,
    },
  });

  return reflections.flatMap((reflection) => {
    const prayerNote = reflection.prayerNote?.trim();
    if (!prayerNote) return [];
    return [
      {
        id: reflection.id,
        reflectionDate: reflection.reflectionDate,
        prayerNote,
      },
    ];
  });
}
