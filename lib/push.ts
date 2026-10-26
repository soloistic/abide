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

  // web-push rejects a subject that is not a mailto: or https: URI at send
  // time with a cryptic error, so treat a malformed value as unconfigured.
  if (
    !publicKey ||
    !privateKey ||
    !subject ||
    !/^(?:mailto:|https:\/\/)/i.test(subject)
  ) {
    return null;
  }

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

function pushErrorStatusCode(error: unknown) {
  if (!error || typeof error !== "object") return Number.NaN;

  const statusCode =
    "statusCode" in error ? Number(error.statusCode) : Number.NaN;

  return statusCode;
}

export function isPushSubscriptionGone(error: unknown) {
  const statusCode = pushErrorStatusCode(error);

  return statusCode === 404 || statusCode === 410;
}

// The push service refused the request: the stored keys no longer match the
// configured VAPID keys (after a key rotation) or the subscription payload is
// malformed. The row is kept so the same endpoint can be re-saved once the
// device subscribes again, but it needs to be re-enabled by the user.
export function isPushSubscriptionRejected(error: unknown) {
  const statusCode = pushErrorStatusCode(error);

  return statusCode === 400 || statusCode === 403;
}
