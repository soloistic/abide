import type { Metadata } from "next";
import Link from "next/link";
import { FruitTags } from "@/components/fruit-tags";
import { formatReflectionDate } from "@/lib/dates";
import { groupReflectionsByMonth } from "@/lib/reflection-insights";
import { getAllReflections } from "@/lib/reflections";

export const metadata: Metadata = {
  title: "Fruit timeline",
};

function excerpt(value: string, length = 180) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}

export default async function TimelinePage() {
  const reflections = await getAllReflections();
  const months = groupReflectionsByMonth(reflections);

  return (
    <main className="page-shell">
      <header className="site-header">
        <Link className="wordmark" href="/">
          Abide
        </Link>
        <Link className="header-link" href="/">
          Dashboard
        </Link>
      </header>

      <header className="timeline-heading">
        <p className="eyebrow">Your journey</p>
        <h1>Fruit timeline</h1>
        <p>
          A record of ordinary moments where grace has been shaping your
          character over time.
        </p>
      </header>

      {months.length ? (
        <div className="timeline">
          {months.map((month) => (
            <section className="timeline-month" key={month.key}>
              <h2>{month.label}</h2>
              <div className="timeline-list">
                {month.reflections.map((reflection) => (
                  <article className="timeline-entry" key={reflection.id}>
                    <time dateTime={reflection.reflectionDate.toISOString()}>
                      {formatReflectionDate(reflection.reflectionDate, {
                        day: "numeric",
                        month: "short",
                      })}
                    </time>
                    <div>
                      <FruitTags fruits={reflection.fruits} />
                      <h3>{excerpt(reflection.lessonLearned, 120)}</h3>
                      <p>{excerpt(reflection.journalText)}</p>
                      <Link href={`/reflections/${reflection.id}`}>
                        Read the full reflection <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>Your timeline will grow gently.</h3>
          <p>
            Once you save a reflection, it will become the first moment in this
            record of growth.
          </p>
          <Link className="button button-primary" href="/reflections/new">
            Write your first reflection
          </Link>
        </div>
      )}
    </main>
  );
}
