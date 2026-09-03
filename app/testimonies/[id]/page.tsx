import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FruitTags } from "@/components/fruit-tags";
import { TestimonyEditForm } from "@/components/testimony-edit-form";
import { formatReflectionDate } from "@/lib/dates";
import { getTestimonyDraft, getTestimonySources } from "@/lib/testimonies";

export const metadata: Metadata = {
  title: "Testimony draft",
};

function excerpt(value: string, length = 160) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}

export default async function TestimonyDraftPage({
  params,
}: PageProps<"/testimonies/[id]">) {
  const { id } = await params;
  const draft = await getTestimonyDraft(id);

  if (!draft) notFound();

  const sources = await getTestimonySources(draft.reflectionIds);
  const foundIds = new Set(sources.map((source) => source.id));
  const removedCount = draft.reflectionIds.filter(
    (reflectionId) => !foundIds.has(reflectionId),
  ).length;

  return (
    <main className="page-shell narrow-shell">
      <Link className="back-link" href="/testimonies">
        ← Testimonies
      </Link>
      <header className="page-heading">
        <p className="eyebrow">Private draft · only you can see this</p>
        <h1>{draft.title}</h1>
        {draft.theme ? <p>Gathered around {draft.theme}.</p> : null}
      </header>

      <TestimonyEditForm
        id={draft.id}
        initialValues={{ title: draft.title, body: draft.body }}
      />

      <section className="recent-section" aria-labelledby="sources-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Where this comes from</p>
            <h2 id="sources-heading">Linked reflections</h2>
          </div>
        </div>
        {sources.length || removedCount ? (
          <div className="reflection-list">
            {sources.map((source) => (
              <Link
                className="reflection-card"
                href={`/reflections/${source.id}`}
                key={source.id}
              >
                <time dateTime={source.reflectionDate.toISOString()}>
                  {formatReflectionDate(source.reflectionDate, {
                    day: "numeric",
                    month: "short",
                  })}
                </time>
                <div>
                  <FruitTags fruits={source.fruits} />
                  <p>{excerpt(source.lessonLearned)}</p>
                </div>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
            {removedCount ? (
              <p className="section-intro">
                {removedCount === 1
                  ? "One linked reflection has been removed from your journal."
                  : `${removedCount} linked reflections have been removed from your journal.`}{" "}
                Your draft keeps the words you already shaped.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No linked reflections remain.</h3>
            <p>Your draft keeps the words you already shaped.</p>
          </div>
        )}
      </section>

      <footer className="reflection-actions">
        <Link
          className="button button-danger"
          href={`/testimonies/${draft.id}/delete`}
        >
          Delete draft
        </Link>
      </footer>
    </main>
  );
}
