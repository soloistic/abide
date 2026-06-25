import type { Metadata } from "next";
import Link from "next/link";
import { FruitTags } from "@/components/fruit-tags";
import { LogoutForm } from "@/components/logout-form";
import { formatReflectionDate } from "@/lib/dates";
import { FRUIT_LABELS, FRUITS } from "@/lib/fruits";
import { groupReflectionsByMonth } from "@/lib/reflection-insights";
import { getTimelineReflections } from "@/lib/reflections";
import {
  hasTimelineFilters,
  parseTimelineFilters,
  TIMELINE_PAGE_SIZE,
  timelineHref,
} from "@/lib/timeline-filters";

export const metadata: Metadata = {
  title: "Fruit timeline",
};

function excerpt(value: string, length = 180) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}

function resultCopy(totalCount: number) {
  if (totalCount === 0) return "No reflections found";
  if (totalCount === 1) return "1 reflection found";
  return `${totalCount} reflections found`;
}

export default async function TimelinePage({
  searchParams,
}: PageProps<"/reflections/timeline">) {
  const filters = parseTimelineFilters(await searchParams);
  const { reflections, totalCount, hasNextPage } = await getTimelineReflections(
    filters,
    TIMELINE_PAGE_SIZE,
  );
  const months = groupReflectionsByMonth(reflections);
  const hasFilters = hasTimelineFilters(filters);

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
          <LogoutForm />
        </nav>
      </header>

      <header className="timeline-heading">
        <p className="eyebrow">Your journey</p>
        <h1>Fruit timeline</h1>
        <p>
          A record of ordinary moments where grace has been shaping your
          character over time.
        </p>
      </header>

      <section className="timeline-tools" aria-labelledby="timeline-tools-heading">
        <div>
          <p className="eyebrow">Find moments to revisit</p>
          <h2 id="timeline-tools-heading">Search your reflections</h2>
        </div>
        <form action="/reflections/timeline" className="timeline-filter-form">
          <label>
            <span>Words or Scripture</span>
            <input
              defaultValue={filters.query}
              name="q"
              placeholder="peace, neighbour, Romans 12"
              type="search"
            />
          </label>
          <label>
            <span>Fruit</span>
            <select defaultValue={filters.fruit} name="fruit">
              <option value="">Any fruit</option>
              {FRUITS.map((fruit) => (
                <option key={fruit} value={fruit}>
                  {FRUIT_LABELS[fruit]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Month</span>
            <input defaultValue={filters.month} name="month" type="month" />
          </label>
          <div className="timeline-filter-actions">
            <button className="button button-primary" type="submit">
              Find moments
            </button>
            {hasFilters ? (
              <Link className="text-link" href="/reflections/timeline">
                Clear filters
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      <div className="timeline-results-heading">
        <p>{resultCopy(totalCount)}</p>
        {totalCount > TIMELINE_PAGE_SIZE ? (
          <p>
            Page {filters.page} of {Math.ceil(totalCount / TIMELINE_PAGE_SIZE)}
          </p>
        ) : null}
      </div>

      {months.length ? (
        <>
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
                        {reflection.scriptureRef ? (
                          <p className="rooted-in">
                            Rooted in {reflection.scriptureRef}
                          </p>
                        ) : null}
                        <Link href={`/reflections/${reflection.id}`}>
                          Read the full reflection{" "}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <nav className="pagination" aria-label="Timeline pages">
            {filters.page > 1 ? (
              <Link href={timelineHref(filters, filters.page - 1)}>
                ← Newer reflections
              </Link>
            ) : (
              <span aria-disabled="true">← Newer reflections</span>
            )}
            {hasNextPage ? (
              <Link href={timelineHref(filters, filters.page + 1)}>
                Older reflections →
              </Link>
            ) : (
              <span aria-disabled="true">Older reflections →</span>
            )}
          </nav>
        </>
      ) : (
        <div className="empty-state">
          {hasFilters ? (
            <>
              <h3>No matching reflections surfaced yet.</h3>
              <p>
                Try a broader word, another fruit, or a different month when
                you are ready to keep looking.
              </p>
              <Link className="button button-primary" href="/reflections/timeline">
                Return to the full timeline
              </Link>
            </>
          ) : (
            <>
              <h3>Your timeline will grow gently.</h3>
              <p>
                Once you save a reflection, it will become the first moment in
                this record of growth.
              </p>
              <Link className="button button-primary" href="/reflections/new">
                Write your first reflection
              </Link>
            </>
          )}
        </div>
      )}
    </main>
  );
}
