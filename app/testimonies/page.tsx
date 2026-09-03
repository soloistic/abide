import type { Metadata } from "next";
import Link from "next/link";
import { LogoutForm } from "@/components/logout-form";
import { formatReflectionDate } from "@/lib/dates";
import { getTestimonyDrafts } from "@/lib/testimonies";

export const metadata: Metadata = {
  title: "Testimonies",
};

function excerpt(value: string, length = 180) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}

export default async function TestimoniesPage() {
  const drafts = await getTestimonyDrafts();

  return (
    <main className="page-shell">
      <header className="site-header">
        <Link className="wordmark" href="/">
          Abide
        </Link>
        <nav className="header-nav" aria-label="Primary navigation">
          <Link className="header-link" href="/">
            Dashboard
          </Link>
          <Link className="header-link" href="/reflections/timeline">
            Fruit timeline
          </Link>
          <Link className="header-link" href="/prayers">
            Prayers
          </Link>
          <LogoutForm />
        </nav>
      </header>

      <header className="timeline-heading">
        <p className="eyebrow">Your story</p>
        <h1>Testimonies</h1>
        <p>
          Gather a few reflections into a private draft, then shape it slowly
          in your own words. Nothing here is shared or scored.
        </p>
      </header>

      <div className="timeline-filter-actions">
        <Link className="button button-primary" href="/testimonies/new">
          Begin a new draft
        </Link>
      </div>

      <section className="recent-section" aria-labelledby="drafts-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Private to you</p>
            <h2 id="drafts-heading">Your drafts</h2>
          </div>
        </div>

        {drafts.length ? (
          <div className="reflection-list">
            {drafts.map((draft) => (
              <Link
                className="reflection-card"
                href={`/testimonies/${draft.id}`}
                key={draft.id}
              >
                <time dateTime={draft.updatedAt.toISOString()}>
                  {formatReflectionDate(draft.updatedAt, {
                    day: "numeric",
                    month: "short",
                  })}
                </time>
                <div>
                  <p>
                    <strong>{draft.title}</strong>
                  </p>
                  {draft.theme ? (
                    <span className="rooted-in">
                      Gathered around {draft.theme}
                    </span>
                  ) : null}
                  <p>{excerpt(draft.body)}</p>
                </div>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No drafts yet.</h3>
            <p>
              When you are ready, gather a few moments you would like to hold
              together as one story.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
