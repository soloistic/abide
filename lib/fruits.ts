import type { Fruit } from "@/generated/prisma/client";

export const FRUITS = [
  "LOVE",
  "JOY",
  "PEACE",
  "PATIENCE",
  "KINDNESS",
  "GOODNESS",
  "FAITHFULNESS",
  "GENTLENESS",
  "SELF_CONTROL",
] as const satisfies readonly Fruit[];

export type FruitValue = (typeof FRUITS)[number];

export const FRUIT_LABELS: Record<FruitValue, string> = {
  LOVE: "Love",
  JOY: "Joy",
  PEACE: "Peace",
  PATIENCE: "Patience",
  KINDNESS: "Kindness",
  GOODNESS: "Goodness",
  FAITHFULNESS: "Faithfulness",
  GENTLENESS: "Gentleness",
  SELF_CONTROL: "Self-control",
};
