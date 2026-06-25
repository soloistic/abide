import Link from "next/link";
import { FruitTags } from "@/components/fruit-tags";
import { formatReflectionDate } from "@/lib/dates";
import { FRUIT_LABELS } from "@/lib/fruits";
import {
  getFruitTrends,
  getGrowthHighlights,
  getRecentReflections,
  getTodayReflection,
} from "@/lib/reflections";

function excerpt(value: string, length = 150) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}

export default async function Home() {
  const [todayReflection, recentReflections, fruitTrends, growthHighlights] =
    await Promise.all([
      getTodayReflection(),
      getRecentReflections(),
      getFruitTrends(),
      getGrowthHighlights(),
    ]);
  const highestCount = fruitTrends[0]?.count ?? 0;

  return (
    <main className="page-shell">
      <header className="site-header">
        <Link className="wordmark" href="/">
          Abide
        </Link>
        <nav className="header-nav" aria-label="Primary navigation">
          <Link href="/reflections/timeline">Fruit timeline</Link>
          <span>A quiet record of transformation</span>
        </nav>
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

      <section className="highlights-section" aria-labelledby="highlights-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Growth worth remembering</p>
            <h2 id="highlights-heading">Highlights from your journey</h2>
          </div>
        </div>

        {growthHighlights.length ? (
          <div className="highlight-grid">
            {growthHighlights.map(({ fruit, count, reflection }) => (
              <Link
                className="highlight-card"
                href={`/reflections/${reflection.id}`}
                key={fruit}
              >
                <p className="eyebrow">
                  {FRUIT_LABELS[fruit]} keeps appearing
                </p>
                <h3>
                  You have noticed {FRUIT_LABELS[fruit].toLowerCase()} in{" "}
                  {count} reflections.
                </h3>
                <p>{excerpt(reflection.lessonLearned, 145)}</p>
                <span>
                  Revisit this reflection from{" "}
                  {formatReflectionDate(reflection.reflectionDate, {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Growth becomes clearer in the looking back.</h3>
            <p>
              After a few reflections, meaningful patterns from your journey
              will gather here.
            </p>
          </div>
        )}
      </section>

      <section className="trends-section" aria-labelledby="trends-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">What you have noticed</p>
            <h2 id="trends-heading">Fruit appearing in your reflections</h2>
          </div>
        </div>

        {fruitTrends.length ? (
          <>
            <p className="section-intro">
              These are the fruits you have named most often—not a score, simply
              a way to notice where growth has been catching your attention.
            </p>
            <ol className="trend-list">
              {fruitTrends.map((trend) => (
                <li key={trend.fruit}>
                  <div>
                    <span>{FRUIT_LABELS[trend.fruit]}</span>
                    <span>
                      {trend.count} {trend.count === 1 ? "reflection" : "reflections"}
                    </span>
                  </div>
                  <span className="trend-track" aria-hidden="true">
                    <span
                      style={{
                        width: `${Math.max(12, (trend.count / highestCount) * 100)}%`,
                      }}
                    />
                  </span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <div className="empty-state">
            <h3>Patterns will emerge with time.</h3>
            <p>
              Fruit trends will appear after you add reflections, helping you
              notice what has been present without turning growth into a score.
            </p>
          </div>
        )}
      </section>

      <section className="recent-section" aria-labelledby="recent-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your journey</p>
            <h2 id="recent-heading">Recent reflections</h2>
          </div>
          <Link className="text-link" href="/reflections/timeline">
            View fruit timeline →
          </Link>
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
