import { dateKeyToUtc } from "@/lib/dates";
import {
  isPushSubscriptionGone,
  isPushSubscriptionRejected,
  pushIsConfigured,
  sendPushNotification,
} from "@/lib/push";
import {
  deletePushSubscription,
  getReminderSubscriptionsDue,
  recordReminderSent,
} from "@/lib/push-subscriptions";
import { prisma } from "@/lib/prisma";
import {
  buildDailyReminderPayload,
  getDailyReminderDateKey,
  getLocalHour,
  isDailyReminderHour,
} from "@/lib/reminders";
import { constantTimeEqual } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Web Push involves a few network round trips per device; leave room for a
// slower provider instead of clipping the run at the default 10 seconds.
export const maxDuration = 30;

function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return Response.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("authorization") ?? "";

  if (!constantTimeEqual(authorization, `Bearer ${cronSecret}`)) {
    return unauthorized();
  }

  if (!pushIsConfigured()) {
    return Response.json(
      { error: "Push notifications are not configured." },
      { status: 503 },
    );
  }

  const now = new Date();

  if (!isDailyReminderHour(now)) {
    return Response.json({
      skipped: "outside-reminder-hour",
      localHour: getLocalHour(now),
    });
  }

  const dateKey = getDailyReminderDateKey(now);
  const reminderDate = dateKeyToUtc(dateKey);
  const reflection = await prisma.fruitReflection.findUnique({
    where: { reflectionDate: reminderDate },
    select: { id: true },
  });

  if (reflection) {
    return Response.json({
      skipped: "already-reflected",
      dateKey,
    });
  }

  const subscriptions = await getReminderSubscriptionsDue(reminderDate);

  if (!subscriptions.length) {
    return Response.json({
      dateKey,
      sent: 0,
      removed: 0,
      failed: 0,
    });
  }

  const payload = buildDailyReminderPayload();
  const results = await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await sendPushNotification(subscription, payload);
        await recordReminderSent(subscription.id, reminderDate);
        return "sent" as const;
      } catch (error) {
        if (isPushSubscriptionGone(error)) {
          await deletePushSubscription(subscription.id);
          return "removed" as const;
        }

        if (isPushSubscriptionRejected(error)) {
          // Keep the row: after a VAPID key rotation the same endpoint can be
          // re-saved with fresh keys once the device re-enables the reminder.
          console.error(
            "Daily reminder rejected for subscription; the device must re-enable it",
            error,
          );
          return "rejected" as const;
        }

        console.error("Unable to send daily reminder", error);
        return "failed" as const;
      }
    }),
  );

  return Response.json({
    dateKey,
    sent: results.filter((result) => result === "sent").length,
    removed: results.filter((result) => result === "removed").length,
    rejected: results.filter((result) => result === "rejected").length,
    failed: results.filter((result) => result === "failed").length,
  });
}
