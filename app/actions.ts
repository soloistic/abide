"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth";
import { dateKeyToUtc, getDateKey } from "@/lib/dates";
import { FRUITS } from "@/lib/fruits";
import { prisma } from "@/lib/prisma";
import {
  buildTestimonyDraft,
  TESTIMONY_DELETE_CONFIRM_VALUE,
  testimonyDraftSchema,
  testimonySelectionSchema,
} from "@/lib/testimony";

const reflectionSchema = z.object({
  focusFruit: z.union([z.enum(FRUITS), z.literal("")]),
  journalText: z
    .string()
    .trim()
    .min(10, "Write a little more about what happened today.")
    .max(5000, "Keep this reflection under 5,000 characters."),
  fruits: z
    .array(z.enum(FRUITS))
    .min(1, "Choose at least one fruit that was present."),
  scriptureRef: z
    .string()
    .trim()
    .max(120, "Keep the Scripture reference under 120 characters."),
  lessonLearned: z
    .string()
    .trim()
    .min(5, "Share a little about what God is teaching you.")
    .max(5000, "Keep this reflection under 5,000 characters."),
  prayerNote: z
    .string()
    .trim()
    .max(5000, "Keep this prayer note under 5,000 characters."),
});

export type ReflectionFormState = {
  message?: string;
  errors?: Partial<
    Record<
      | "focusFruit"
      | "journalText"
      | "fruits"
      | "scriptureRef"
      | "lessonLearned"
      | "prayerNote",
      string[]
    >
  >;
  values?: {
    focusFruit: string;
    journalText: string;
    fruits: string[];
    scriptureRef: string;
    lessonLearned: string;
    prayerNote: string;
  };
};

function getReflectionValues(formData: FormData) {
  return {
    focusFruit: String(formData.get("focusFruit") ?? ""),
    journalText: String(formData.get("journalText") ?? ""),
    fruits: formData.getAll("fruits").map(String),
    scriptureRef: String(formData.get("scriptureRef") ?? ""),
    lessonLearned: String(formData.get("lessonLearned") ?? ""),
    prayerNote: String(formData.get("prayerNote") ?? ""),
  };
}

export async function createReflection(
  _previousState: ReflectionFormState,
  formData: FormData,
): Promise<ReflectionFormState> {
  await requireAuthenticatedUser();

  const values = getReflectionValues(formData);
  const result = reflectionSchema.safeParse(values);

  if (!result.success) {
    return {
      message: "A few details need your attention.",
      errors: result.error.flatten().fieldErrors,
      values,
    };
  }

  let reflectionId: string;

  try {
    const reflection = await prisma.fruitReflection.create({
      data: {
        reflectionDate: dateKeyToUtc(getDateKey()),
        focusFruit: result.data.focusFruit || null,
        journalText: result.data.journalText,
        fruits: result.data.fruits,
        scriptureRef: result.data.scriptureRef || null,
        lessonLearned: result.data.lessonLearned,
        prayerNote: result.data.prayerNote || null,
      },
    });
    reflectionId = reflection.id;
  } catch (error) {
    const knownError = error as { code?: string };

    if (knownError.code === "P2002") {
      return {
        message: "Today’s reflection already exists. Open it from the dashboard.",
        values,
      };
    }

    console.error("Unable to save reflection", error);
    return {
      message: "We couldn’t save your reflection. Please try again.",
      values,
    };
  }

  revalidatePath("/");
  revalidatePath("/reflections/timeline");
  redirect(`/reflections/${reflectionId}`);
}

export async function updateReflection(
  id: string,
  _previousState: ReflectionFormState,
  formData: FormData,
): Promise<ReflectionFormState> {
  await requireAuthenticatedUser();

  const values = getReflectionValues(formData);
  const result = reflectionSchema.safeParse(values);

  if (!result.success) {
    return {
      message: "A few details need your attention.",
      errors: result.error.flatten().fieldErrors,
      values,
    };
  }

  try {
    await prisma.fruitReflection.update({
      where: { id },
      data: {
        focusFruit: result.data.focusFruit || null,
        journalText: result.data.journalText,
        fruits: result.data.fruits,
        scriptureRef: result.data.scriptureRef || null,
        lessonLearned: result.data.lessonLearned,
        prayerNote: result.data.prayerNote || null,
      },
    });
  } catch (error) {
    const knownError = error as { code?: string };

    if (knownError.code === "P2025") {
      return { message: "This reflection could not be found." };
    }

    console.error("Unable to update reflection", error);
    return {
      message: "We couldn’t update your reflection. Please try again.",
      values,
    };
  }

  revalidatePath("/");
  revalidatePath("/reflections/timeline");
  revalidatePath(`/reflections/${id}`);
  redirect(`/reflections/${id}`);
}

export async function deleteReflection(id: string) {
  await requireAuthenticatedUser();

  try {
    await prisma.fruitReflection.delete({ where: { id } });
  } catch (error) {
    const knownError = error as { code?: string };

    if (knownError.code !== "P2025") {
      console.error("Unable to delete reflection", error);
      throw new Error("Unable to delete reflection.");
    }
  }

  revalidatePath("/");
  revalidatePath("/reflections/timeline");
  redirect("/");
}

export type TestimonyNewFormState = {
  message?: string;
  errors?: Partial<Record<"theme" | "reflectionIds", string[]>>;
  values?: {
    theme: string;
    reflectionIds: string[];
  };
};

export async function createTestimony(
  _previousState: TestimonyNewFormState,
  formData: FormData,
): Promise<TestimonyNewFormState> {
  await requireAuthenticatedUser();

  const values = {
    theme: String(formData.get("theme") ?? ""),
    reflectionIds: formData.getAll("reflectionIds").map(String),
  };
  const result = testimonySelectionSchema.safeParse(values);

  if (!result.success) {
    return {
      message: "A few details need your attention.",
      errors: result.error.flatten().fieldErrors,
      values,
    };
  }

  const sources = await prisma.fruitReflection.findMany({
    where: { id: { in: result.data.reflectionIds } },
  });

  if (sources.length !== result.data.reflectionIds.length) {
    return {
      message: "One of the chosen reflections could not be found.",
      values,
    };
  }

  const draft = buildTestimonyDraft(result.data.theme, sources);
  const theme = result.data.theme.trim();

  let testimonyId: string;

  try {
    const testimony = await prisma.testimonyDraft.create({
      data: {
        title: draft.title,
        theme: theme || null,
        body: draft.body,
        reflectionIds: result.data.reflectionIds,
      },
    });
    testimonyId = testimony.id;
  } catch (error) {
    console.error("Unable to gather testimony draft", error);
    return {
      message: "We couldn’t gather your draft. Please try again.",
      values,
    };
  }

  revalidatePath("/testimonies");
  redirect(`/testimonies/${testimonyId}`);
}

export type TestimonyEditFormState = {
  message?: string;
  errors?: Partial<Record<"title" | "body", string[]>>;
  values?: {
    title: string;
    body: string;
  };
};

export async function updateTestimony(
  id: string,
  _previousState: TestimonyEditFormState,
  formData: FormData,
): Promise<TestimonyEditFormState> {
  await requireAuthenticatedUser();

  const values = {
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
  };
  const result = testimonyDraftSchema.safeParse(values);

  if (!result.success) {
    return {
      message: "A few details need your attention.",
      errors: result.error.flatten().fieldErrors,
      values,
    };
  }

  try {
    await prisma.testimonyDraft.update({
      where: { id },
      data: {
        title: result.data.title,
        body: result.data.body,
      },
    });
  } catch (error) {
    const knownError = error as { code?: string };

    if (knownError.code === "P2025") {
      return { message: "This draft could not be found." };
    }

    console.error("Unable to update testimony draft", error);
    return {
      message: "We couldn’t save your draft. Please try again.",
      values,
    };
  }

  revalidatePath("/testimonies");
  revalidatePath(`/testimonies/${id}`);
  redirect(`/testimonies/${id}`);
}

export async function deleteTestimony(id: string, formData: FormData) {
  await requireAuthenticatedUser();

  if (formData.get("confirm") !== TESTIMONY_DELETE_CONFIRM_VALUE) {
    redirect(`/testimonies/${id}/delete`);
  }

  try {
    await prisma.testimonyDraft.delete({ where: { id } });
  } catch (error) {
    const knownError = error as { code?: string };

    if (knownError.code !== "P2025") {
      console.error("Unable to delete testimony draft", error);
      throw new Error("Unable to delete testimony draft.");
    }
  }

  revalidatePath("/testimonies");
  redirect("/testimonies");
}
