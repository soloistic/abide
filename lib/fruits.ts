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

export const FRUIT_PROMPTS: Record<FruitValue, readonly [string, string]> = {
  LOVE: [
    "Where did you receive or offer love when it cost something?",
    "Who might God be inviting you to see with greater care?",
  ],
  JOY: [
    "What gave you a quiet sense of delight or gratitude today?",
    "Where did joy remain present even if the day was difficult?",
  ],
  PEACE: [
    "When did you notice calm, trust, or reconciliation taking root?",
    "What are you being invited to release rather than control?",
  ],
  PATIENCE: [
    "Where did waiting reveal something about your heart?",
    "How did you respond when another person or situation moved slowly?",
  ],
  KINDNESS: [
    "What small act of care mattered more than it first appeared?",
    "Where could gentler attention change an ordinary interaction?",
  ],
  GOODNESS: [
    "When did you choose what was right, generous, or life-giving?",
    "What good work seems worth continuing tomorrow?",
  ],
  FAITHFULNESS: [
    "Where did you keep showing up, even without visible results?",
    "What commitment is God helping you tend with steadiness?",
  ],
  GENTLENESS: [
    "Where did strength look like tenderness or restraint today?",
    "How might you speak more gently to yourself or someone else?",
  ],
  SELF_CONTROL: [
    "When did you pause before reacting or choosing?",
    "What desire needs wise boundaries so something better can grow?",
  ],
};
