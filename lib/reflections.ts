import { connection } from "next/server";
import { dateKeyToUtc, getDateKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

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

export async function getReflection(id: string) {
  await connection();
  return prisma.fruitReflection.findUnique({
    where: { id },
  });
}
