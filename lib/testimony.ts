import { z } from "zod";
import { formatReflectionDate } from "./dates";
import { FRUIT_LABELS, type FruitValue } from "./fruits";

export const MAX_TESTIMONY_SOURCES = 8;

export const TESTIMONY_DELETE_CONFIRM_VALUE = "yes-delete";

export type TestimonySource = {
  id: string;
  reflectionDate: Date;
  fruits: FruitValue[];
  scriptureRef: string | null;
  lessonLearned: string;
  prayerNote: string | null;
};

export const testimonySelectionSchema = z.object({
  theme: z
    .string()
    .trim()
    .max(120, "Keep the theme under 120 characters."),
  reflectionIds: z
    .array(z.string().min(1))
    .min(1, "Choose at least one reflection to gather into this draft.")
    .max(
      MAX_TESTIMONY_SOURCES,
      `Keep this draft to ${MAX_TESTIMONY_SOURCES} reflections or fewer so it stays easy to shape.`,
    ),
});

export const testimonyDraftSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give this draft a title.")
    .max(120, "Keep the title under 120 characters."),
  body: z
    .string()
    .trim()
    .min(1, "Write a little of your story before saving.")
    .max(20000, "Keep this draft under 20,000 characters."),
});

export function buildTestimonyDraft(
  theme: string,
  sources: TestimonySource[],
): { title: string; body: string } {
  const ordered = [...sources].sort(
    (a, b) => a.reflectionDate.getTime() - b.reflectionDate.getTime(),
  );
  const trimmedTheme = theme.trim();
  const title = trimmedTheme || "A testimony in progress";

  const sections = ordered.map((source) => {
    const lines = [
      `A moment from ${formatReflectionDate(source.reflectionDate)}`,
      "",
      `What I noticed then: “${source.lessonLearned.trim()}”`,
    ];

    if (source.fruits.length) {
      const labels = source.fruits.map((fruit) => FRUIT_LABELS[fruit]);
      lines.push(`Fruit present: ${labels.join(", ")}.`);
    }

    if (source.scriptureRef?.trim()) {
      lines.push(`Rooted in ${source.scriptureRef.trim()}.`);
    }

    if (source.prayerNote?.trim()) {
      lines.push(`I had prayed: “${source.prayerNote.trim()}”`);
    }

    lines.push("", "Say what this moment means to you now, in your own words.");
    return lines.join("\n");
  });

  const body = [
    "A starting place — rewrite everything below in your own words.",
    "",
    "Where this begins",
    trimmedTheme
      ? `These moments gather around ${trimmedTheme}.`
      : "These are a few moments worth holding together.",
    "Write a few honest sentences about the season they come from.",
    "",
    ...sections.flatMap((section) => [section, ""]),
    "What I carry forward",
    "Name what you want to remember, and what you are still learning.",
  ].join("\n");

  return { title, body };
}
