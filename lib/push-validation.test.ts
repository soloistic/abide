import { describe, expect, it } from "vitest";
import {
  pushEndpointSchema,
  pushSubscriptionInputSchema,
} from "./push-validation";

const validSubscription = {
  endpoint: "https://push.example.com/subscription/abc",
  expirationTime: null,
  keys: {
    auth: "auth-secret",
    p256dh: "public-key",
  },
};

describe("push subscription validation", () => {
  it("accepts a complete browser subscription", () => {
    expect(pushSubscriptionInputSchema.safeParse(validSubscription).success).toBe(
      true,
    );
    expect(
      pushSubscriptionInputSchema.safeParse({
        ...validSubscription,
        expirationTime: 1_790_000_000_000,
      }).success,
    ).toBe(true);
  });

  it("rejects incomplete or malformed subscriptions", () => {
    expect(
      pushSubscriptionInputSchema.safeParse({
        ...validSubscription,
        endpoint: "not-a-url",
      }).success,
    ).toBe(false);
    expect(
      pushSubscriptionInputSchema.safeParse({
        ...validSubscription,
        keys: { auth: "", p256dh: "public-key" },
      }).success,
    ).toBe(false);
    expect(
      pushSubscriptionInputSchema.safeParse({
        ...validSubscription,
        keys: { auth: "auth-secret" },
      }).success,
    ).toBe(false);
  });

  it("validates a single endpoint for unsubscribe and test actions", () => {
    expect(pushEndpointSchema.safeParse(validSubscription.endpoint).success).toBe(
      true,
    );
    expect(pushEndpointSchema.safeParse("javascript:alert(1)").success).toBe(
      false,
    );
  });
});
