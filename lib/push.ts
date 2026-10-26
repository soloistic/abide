import "server-only";

import webpush from "web-push";

export type PushConfig = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

export type StoredPushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

function getPushConfig(): PushConfig | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim();

  if (!publicKey || !privateKey || !subject) return null;

  return { publicKey, privateKey, subject };
}

export function pushIsConfigured() {
  return getPushConfig() !== null;
}

export function getPushPublicKey() {
  return getPushConfig()?.publicKey ?? null;
}

function configureWebPush() {
  const config = getPushConfig();

  if (!config) return null;

  webpush.setVapidDetails(
    config.subject,
    config.publicKey,
    config.privateKey,
  );

  return config;
}

export async function sendPushNotification(
  subscription: StoredPushSubscription,
  payload: unknown,
) {
  if (!configureWebPush()) {
    throw new Error("Push notifications are not configured.");
  }

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.auth,
        p256dh: subscription.p256dh,
      },
    },
    JSON.stringify(payload),
    {
      TTL: 60 * 60 * 12,
      urgency: "normal",
    },
  );
}

export function isPushSubscriptionGone(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const statusCode =
    "statusCode" in error ? Number(error.statusCode) : Number.NaN;

  return statusCode === 404 || statusCode === 410;
}
