import type { Metadata } from "next";
import Link from "next/link";
import { LogoutForm } from "@/components/logout-form";
import { formatReflectionDate } from "@/lib/dates";
import { selectPrayerInvitation } from "@/lib/prayer-invitations";
import { getPrayerEntries } from "@/lib/prayers";

export const metadata: Metadata = {
  title: "Prayers",
};

function excerpt(value: string, length = 220) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}

export default async function PrayersPage() {
  const prayers = await getPrayerEntries();
  const invitation = selectPrayerInvitation(prayers);

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
          <Link className="header-link" href="/testimonies">
            Testimonies
          </Link>
          <LogoutForm />
        </nav>
      </header>

      <header className="timeline-heading">
        <p className="eyebrow">Carried in prayer</p>
        <h1>Prayers</h1>
        <p>
          The prayers you have written alongside your reflections, gathered in
          one quiet place. Nothing here needs finishing or resolving—simply
          notice what is still on your heart.
        </p>
      </header>

      {prayers.length ? (
        <>
          {invitation ? (
            <section
              className="prayer-invitation"
              aria-labelledby="prayer-invitation-heading"
            >
              <p className="eyebrow">An invitation to revisit</p>
              <h2 id="prayer-invitation-heading">
                You might return to this prayer from{" "}
                {formatReflectionDate(invitation.reflectionDate, {
                  day: "numeric",
                  month: "long",
                })}
              </h2>
              <p className="prose-copy">{excerpt(invitation.prayerNote)}</p>
              <p>
                There is no pressure to act or update anything. If it helps,
                sit with these words again and notice what feels tender,
                settled, or still unfolding.
              </p>
              <Link
                className="text-link"
                href={`/reflections/${invitation.id}`}
              >
                Revisit the reflection from{" "}
                {formatReflectionDate(invitation.reflectionDate, {
                  day: "numeric",
                  month: "short",
                })}{" "}
                →
              </Link>
            </section>
          ) : null}

          <section
            className="recent-section prayers-section"
            aria-labelledby="prayers-heading"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">Gathered gently</p>
                <h2 id="prayers-heading">
                  {prayers.length === 1
                    ? "1 prayer carried with you"
                    : `${prayers.length} prayers carried with you`}
                </h2>
              </div>
            </div>

            <div className="reflection-list">
              {prayers.map((prayer) => (
                <Link
                  className="reflection-card"
                  href={`/reflections/${prayer.id}`}
                  key={prayer.id}
                >
                  <time dateTime={prayer.reflectionDate.toISOString()}>
                    {formatReflectionDate(prayer.reflectionDate, {
                      day: "numeric",
                      month: "short",
                    })}
                  </time>
                  <div>
                    <p>{excerpt(prayer.prayerNote)}</p>
                    <span className="rooted-in">
                      Written{" "}
                      {formatReflectionDate(prayer.reflectionDate, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="empty-state">
          <h3>No prayers gathered yet.</h3>
          <p>
            When you add a prayer to a reflection, it will rest here so you
            can return to it apart from the day it was written.
          </p>
          <Link className="button button-primary" href="/reflections/new">
            Write today&apos;s reflection
          </Link>
        </div>
      )}
    </main>
  );
}
