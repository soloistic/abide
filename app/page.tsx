import Link from "next/link";
import { FruitTags } from "@/components/fruit-tags";
import { formatReflectionDate } from "@/lib/dates";
import {
  getRecentReflections,
  getTodayReflection,
} from "@/lib/reflections";

function excerpt(value: string, length = 150) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}

export default async function Home() {
  const [todayReflection, recentReflections] = await Promise.all([
    getTodayReflection(),
    getRecentReflections(),
  ]);

  return (
    <main className="page-shell">
      <header className="site-header">
        <Link className="wordmark" href="/">
          Abide
        </Link>
        <p>A quiet record of transformation</p>
      </header>

      <section className="hero">
        <p className="eyebrow">Your fruit reflection</p>
        <h1>How is God changing you?</h1>
        <p>
          Notice the moments where love, joy, peace, and the other fruits are
          taking root in ordinary life.
        </p>
      </section>

      <section className="today-card" aria-labelledby="today-heading">
        <div>
          <p className="eyebrow">Today</p>
          {todayReflection ? (
            <>
              <h2 id="today-heading">You made space to reflect.</h2>
              <FruitTags fruits={todayReflection.fruits} />
              <p className="today-lesson">
                {excerpt(todayReflection.lessonLearned, 180)}
              </p>
            </>
          ) : (
            <>
              <h2 id="today-heading">Your reflection is still open.</h2>
              <p>
                There is no pressure to perform—only an invitation to notice
                what happened and what may be growing.
              </p>
            </>
          )}
        </div>
        <Link
          className="button button-primary"
          href={
            todayReflection
              ? `/reflections/${todayReflection.id}`
              : "/reflections/new"
          }
        >
          {todayReflection ? "Read today’s reflection" : "Reflect on today"}
        </Link>
      </section>

      <section className="recent-section" aria-labelledby="recent-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your journey</p>
            <h2 id="recent-heading">Recent reflections</h2>
          </div>
        </div>

        {recentReflections.length ? (
          <div className="reflection-list">
            {recentReflections.map((reflection) => (
              <Link
                className="reflection-card"
                href={`/reflections/${reflection.id}`}
                key={reflection.id}
              >
                <time dateTime={reflection.reflectionDate.toISOString()}>
                  {formatReflectionDate(reflection.reflectionDate, {
                    day: "numeric",
                    month: "short",
                  })}
                </time>
                <div>
                  <FruitTags fruits={reflection.fruits} />
                  <p>{excerpt(reflection.journalText)}</p>
                  {reflection.scriptureRef ? (
                    <span className="rooted-in">
                      Rooted in {reflection.scriptureRef}
                    </span>
                  ) : null}
                </div>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Your story begins with one honest moment.</h3>
            <p>
              Recent reflections will gather here as a gentle record of growth.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
