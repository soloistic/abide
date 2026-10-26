import "server-only";

import { prisma } from "@/lib/prisma";
import type { PushSubscriptionInput } from "@/lib/push-validation";

function expirationDate(value: number | null | undefined) {
  if (value == null) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export async function savePushSubscription(input: PushSubscriptionInput) {
  const expirationTime = expirationDate(input.expirationTime);

  return prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    create: {
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      expirationTime,
    },
    update: {
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      expirationTime,
    },
  });
}

export async function removePushSubscription(endpoint: string) {
  await prisma.pushSubscription.deleteMany({
    where: { endpoint },
  });
}

export async function getPushSubscription(endpoint: string) {
  return prisma.pushSubscription.findUnique({
    where: { endpoint },
  });
}

export async function getReminderSubscriptionsDue(reminderDate: Date) {
  return prisma.pushSubscription.findMany({
    where: {
      OR: [
        { lastReminderDate: null },
        { lastReminderDate: { not: reminderDate } },
      ],
    },
  });
}

export async function recordReminderSent(id: string, reminderDate: Date) {
  await prisma.pushSubscription.update({
    where: { id },
    data: { lastReminderDate: reminderDate },
  });
}

export async function deletePushSubscription(id: string) {
  await prisma.pushSubscription.deleteMany({
    where: { id },
  });
}
