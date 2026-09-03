import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteReflectionForm } from "@/components/delete-reflection-form";
import { formatReflectionDate } from "@/lib/dates";
import { getReflection } from "@/lib/reflections";

export const metadata: Metadata = {
  title: "Delete reflection",
};

export default async function DeleteReflectionPage({
  params,
}: PageProps<"/reflections/[id]/delete">) {
  const { id } = await params;
  const reflection = await getReflection(id);

  if (!reflection) notFound();

  return (
    <main className="page-shell narrow-shell">
      <Link className="back-link" href={`/reflections/${id}`}>
        ← Reflection
      </Link>
      <header className="page-heading">
        <p className="eyebrow">{formatReflectionDate(reflection.reflectionDate)}</p>
        <h1>Let go of this reflection?</h1>
        <p>
          Deleting will permanently remove this entry from your journal. This
          cannot be undone. Take a moment before you decide.
        </p>
      </header>
      <DeleteReflectionForm id={reflection.id} />
    </main>
  );
}
