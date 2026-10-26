"use server";

import { requireAuthenticatedUser } from "@/lib/auth";
import {
  deletePushSubscription,
  getPushSubscription,
  removePushSubscription,
  savePushSubscription,
} from "@/lib/push-subscriptions";
import {
  isPushSubscriptionGone,
  pushIsConfigured,
  sendPushNotification,
} from "@/lib/push";
import {
  pushEndpointSchema,
  pushSubscriptionInputSchema,
} from "@/lib/push-validation";
import { buildTestReminderPayload } from "@/lib/reminders";

export type ReminderActionResult =
  | { success: true }
  | { success: false; message: string };

export async function subscribeToDailyReminder(
  input: unknown,
): Promise<ReminderActionResult> {
  await requireAuthenticatedUser();

  const parsed = pushSubscriptionInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "This device did not send a complete reminder subscription.",
    };
  }

  try {
    await savePushSubscription(parsed.data);
    return { success: true };
  } catch (error) {
    console.error("Unable to save reminder subscription", error);
    return {
      success: false,
      message: "The reminder could not be saved. Please try again.",
    };
  }
}

export async function unsubscribeFromDailyReminder(
  endpointInput: unknown,
): Promise<ReminderActionResult> {
  await requireAuthenticatedUser();

  const parsed = pushEndpointSchema.safeParse(endpointInput);

  if (!parsed.success) {
    return {
      success: false,
      message: "This device did not send a complete reminder subscription.",
    };
  }

  try {
    await removePushSubscription(parsed.data);
    return { success: true };
  } catch (error) {
    console.error("Unable to remove reminder subscription", error);
    return {
      success: false,
      message: "The reminder was turned off here, but the server could not be updated. It will clear on its own.",
    };
  }
}

export async function sendTestReminder(
  endpointInput: unknown,
): Promise<ReminderActionResult> {
  await requireAuthenticatedUser();

  if (!pushIsConfigured()) {
    return {
      success: false,
      message: "Reminders are not configured on this deployment yet.",
    };
  }

  const parsed = pushEndpointSchema.safeParse(endpointInput);

  if (!parsed.success) {
    return {
      success: false,
      message: "This device did not send a complete reminder subscription.",
    };
  }

  const subscription = await getPushSubscription(parsed.data);

  if (!subscription) {
    return {
      success: false,
      message: "This device is not registered for the evening reminder yet.",
    };
  }

  try {
    await sendPushNotification(subscription, buildTestReminderPayload());
    return { success: true };
  } catch (error) {
    if (isPushSubscriptionGone(error)) {
      await deletePushSubscription(subscription.id);
      return {
        success: false,
        message: "This device’s reminder has expired. Turn the reminder off and on again.",
      };
    }

    console.error("Unable to send test reminder", error);
    return {
      success: false,
      message: "The test reminder could not be sent. Please try again later.",
    };
  }
}
