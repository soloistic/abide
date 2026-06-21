import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateReflection } from "@/app/actions";
import { ReflectionForm } from "@/components/reflection-form";
import { formatReflectionDate } from "@/lib/dates";
import { getReflection } from "@/lib/reflections";

export const metadata: Metadata = {
  title: "Edit reflection",
};

export default async function EditReflectionPage({
  params,
}: PageProps<"/reflections/[id]/edit">) {
  const { id } = await params;
  const reflection = await getReflection(id);

  if (!reflection) notFound();

  const action = updateReflection.bind(null, id);

  return (
    <main className="page-shell narrow-shell">
      <Link className="back-link" href={`/reflections/${id}`}>
        ← Reflection
      </Link>
      <header className="page-heading">
        <p className="eyebrow">
          {formatReflectionDate(reflection.reflectionDate)}
        </p>
        <h1>Return to this moment.</h1>
        <p>
          Correct a detail or add what became clearer later. The original
          reflection date will stay the same.
        </p>
      </header>
      <ReflectionForm
        action={action}
        initialValues={{
          focusFruit: reflection.focusFruit,
          journalText: reflection.journalText,
          fruits: reflection.fruits,
          scriptureRef: reflection.scriptureRef ?? "",
          lessonLearned: reflection.lessonLearned,
          prayerNote: reflection.prayerNote ?? "",
        }}
        submitLabel="Update reflection"
        pendingLabel="Updating reflection…"
      />
    </main>
  );
}
