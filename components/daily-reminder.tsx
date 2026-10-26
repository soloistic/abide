"use client";

import { useEffect, useState } from "react";
import {
  sendTestReminder,
  subscribeToDailyReminder,
  unsubscribeFromDailyReminder,
} from "@/app/settings/actions";
import type { PushSubscriptionInput } from "@/lib/push-validation";
import { registerAbideServiceWorker } from "@/lib/service-worker";

type ReminderState =
  | "checking"
  | "unconfigured"
  | "unsupported"
  | "blocked"
  | "available"
  | "enabled"
  | "error";

type DailyReminderProps = {
  pushConfigured: boolean;
  vapidPublicKey: string | null;
};

const STATUS_COPY: Record<
  ReminderState,
  { title: string; description: string }
> = {
  checking: {
    title: "Checking this device…",
    description: "You can change this at any time.",
  },
  unconfigured: {
    title: "Reminders are not configured yet.",
    description:
      "Add the reminder keys described in the README, then reload this page.",
  },
  unsupported: {
    title: "This browser cannot show reminders.",
    description:
      "You can still install Abide and reflect whenever you like. On iPhone and iPad, reminders work after Abide is added to the Home Screen.",
  },
  blocked: {
    title: "Notifications are blocked on this device.",
    description:
      "Allow notifications for Abide in your browser or device settings, then reload this page.",
  },
  available: {
    title: "The evening reminder is off.",
    description:
      "Around 8:00 pm, Abide can send one quiet reminder if today’s reflection is still open.",
  },
  enabled: {
    title: "The evening reminder is on for this device.",
    description:
      "It arrives around 8:00 pm when today’s reflection is still open.",
  },
  error: {
    title: "We could not check this device.",
    description: "Refresh the page and try again.",
  },
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replaceAll("-", "+")
    .replaceAll("_", "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function toSubscriptionInput(
  subscription: PushSubscription,
): PushSubscriptionInput {
  const json = subscription.toJSON();
  const endpoint = json.endpoint ?? subscription.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    throw new Error("The browser returned an incomplete push subscription.");
  }

  return {
    endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: { auth, p256dh },
  };
}

export function DailyReminder({
  pushConfigured,
  vapidPublicKey,
}: DailyReminderProps) {
  const [state, setState] = useState<ReminderState>(
    pushConfigured ? "checking" : "unconfigured",
  );
  const [message, setMessage] = useState("");
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!pushConfigured) return;

    let cancelled = false;

    async function checkExistingReminder() {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        if (!cancelled) setState("unsupported");
        return;
      }

      try {
        if (Notification.permission === "denied") {
          if (!cancelled) setState("blocked");
          return;
        }

        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = registration
          ? await registration.pushManager.getSubscription()
          : null;

        if (!subscription) {
          if (!cancelled) setState("available");
          return;
        }

        const input = toSubscriptionInput(subscription);
        const result = await subscribeToDailyReminder(input);

        if (cancelled) return;

        setEndpoint(input.endpoint);
        setState("enabled");

        if (!result.success) {
          setMessage(result.message);
        }
      } catch {
        if (!cancelled) setState("error");
      }
    }

    checkExistingReminder();

    return () => {
      cancelled = true;
    };
  }, [pushConfigured]);

  async function enableReminder() {
    if (isPending || !vapidPublicKey) return;

    setIsPending(true);
    setMessage("");

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "available");

        if (permission === "denied") {
          setMessage(
            "Notifications are blocked. Allow them for Abide in your browser settings, then try again.",
          );
        }

        return;
      }

      const registration = await registerAbideServiceWorker();

      if (!registration) {
        setState("unsupported");
        return;
      }

      await navigator.serviceWorker.ready;

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));
      const input = toSubscriptionInput(subscription);
      const result = await subscribeToDailyReminder(input);

      if (!result.success) {
        setState("available");
        setMessage(result.message);
        return;
      }

      setEndpoint(input.endpoint);
      setState("enabled");
      setMessage("The evening reminder is on for this device.");
    } catch {
      setState("error");
      setMessage("This device could not enable the reminder. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function disableReminder() {
    if (isPending) return;

    setIsPending(true);
    setMessage("");

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = registration
        ? await registration.pushManager.getSubscription()
        : null;
      let nextMessage = "The evening reminder is off for this device.";

      if (subscription) {
        const endpointToRemove = subscription.endpoint;
        const unsubscribed = await subscription.unsubscribe();

        if (!unsubscribed) {
          setMessage(
            "This device could not turn off the reminder. Please try again.",
          );
          return;
        }

        const result = await unsubscribeFromDailyReminder(endpointToRemove);

        if (!result.success) {
          nextMessage = result.message;
        }
      }

      setEndpoint(null);
      setState("available");
      setMessage(nextMessage);
    } catch {
      setMessage(
        "This device could not turn off the reminder. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  }

  async function sendTest() {
    if (isPending || !endpoint) return;

    setIsPending(true);
    setMessage("");

    try {
      const result = await sendTestReminder(endpoint);

      setMessage(
        result.success
          ? "A test reminder was sent. It may take a moment to appear."
          : result.message,
      );
    } catch {
      setMessage("The test reminder could not be sent. Please try again later.");
    } finally {
      setIsPending(false);
    }
  }

  const copy = STATUS_COPY[state];

  return (
    <div className="settings-actions">
      <div className="settings-status" role="status" aria-live="polite">
        <strong>{copy.title}</strong>
        <p>{copy.description}</p>
        {message ? <p className="settings-message">{message}</p> : null}
      </div>

      {state === "enabled" ? (
        <div className="reminder-buttons">
          <button
            className="button button-secondary"
            type="button"
            disabled={isPending}
            onClick={sendTest}
          >
            {isPending ? "Working…" : "Send a test reminder"}
          </button>
          <button
            className="text-link"
            type="button"
            disabled={isPending}
            onClick={disableReminder}
          >
            Turn off on this device
          </button>
        </div>
      ) : null}

      {state === "available" ? (
        <button
          className="button button-primary"
          type="button"
          disabled={isPending}
          onClick={enableReminder}
        >
          {isPending ? "Enabling…" : "Enable evening reminder"}
        </button>
      ) : null}

      <noscript>
        <p className="field-help">
          Turning reminders on needs JavaScript. The rest of Abide works
          without it.
        </p>
      </noscript>
    </div>
  );
}
