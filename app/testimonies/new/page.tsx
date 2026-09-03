import type { Metadata } from "next";
import Link from "next/link";
import { TestimonyNewForm } from "@/components/testimony-new-form";
import { getSelectableReflections } from "@/lib/testimonies";
import { MAX_TESTIMONY_SOURCES } from "@/lib/testimony";

export const metadata: Metadata = {
  title: "Begin a testimony draft",
};

export default async function NewTestimonyPage() {
  const reflections = await getSelectableReflections();

  return (
    <main className="page-shell narrow-shell">
      <Link className="back-link" href="/testimonies">
        ← Testimonies
      </Link>
      <header className="page-heading">
        <p className="eyebrow">A story worth holding</p>
        <h1>Gather a few moments.</h1>
        <p>
          Choose up to {MAX_TESTIMONY_SOURCES} reflections around a theme, a
          fruit, or a season. They will be gathered into a private starting
          place for you to rewrite.
        </p>
      </header>
      {reflections.length ? (
        <TestimonyNewForm reflections={reflections} />
      ) : (
        <div className="empty-state">
          <h3>There are no reflections to gather yet.</h3>
          <p>
            Once you save a reflection, you can return here to begin shaping
            your story.
          </p>
          <Link className="button button-primary" href="/reflections/new">
            Write your first reflection
          </Link>
        </div>
      )}
    </main>
  );
}
