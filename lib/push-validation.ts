import { z } from "zod";

export const pushSubscriptionInputSchema = z.object({
  endpoint: z.url({ protocol: /^https$/ }).max(2048),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    auth: z.string().min(1).max(512),
    p256dh: z.string().min(1).max(512),
  }),
});

export type PushSubscriptionInput = z.infer<
  typeof pushSubscriptionInputSchema
>;

export const pushEndpointSchema = z
  .url({ protocol: /^https$/ })
  .max(2048);
