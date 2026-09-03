import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteTestimonyForm } from "@/components/delete-testimony-form";
import { getTestimonyDraft } from "@/lib/testimonies";

export const metadata: Metadata = {
  title: "Delete testimony draft",
};

export default async function DeleteTestimonyPage({
  params,
}: PageProps<"/testimonies/[id]/delete">) {
  const { id } = await params;
  const draft = await getTestimonyDraft(id);

  if (!draft) notFound();

  return (
    <main className="page-shell narrow-shell">
      <Link className="back-link" href={`/testimonies/${id}`}>
        ← Draft
      </Link>
      <header className="page-heading">
        <p className="eyebrow">Private draft</p>
        <h1>Let go of this draft?</h1>
        <p>
          Deleting will permanently remove “{draft.title}” from your
          testimonies. Your reflections will remain untouched. This cannot be
          undone, so take a moment before you decide.
        </p>
      </header>
      <DeleteTestimonyForm id={draft.id} />
    </main>
  );
}
