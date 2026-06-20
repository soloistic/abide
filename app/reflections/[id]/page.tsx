import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FruitTags } from "@/components/fruit-tags";
import { formatReflectionDate } from "@/lib/dates";
import { getReflection } from "@/lib/reflections";

export const metadata: Metadata = {
  title: "Reflection",
};

export default async function ReflectionDetailPage({
  params,
}: PageProps<"/reflections/[id]">) {
  const { id } = await params;
  const reflection = await getReflection(id);

  if (!reflection) notFound();

  return (
    <main className="page-shell narrow-shell">
      <Link className="back-link" href="/">
        ← Dashboard
      </Link>
      <article className="reflection-detail">
        <header className="page-heading">
          <p className="eyebrow">
            {formatReflectionDate(reflection.reflectionDate)}
          </p>
          <h1>A moment of growth.</h1>
          <FruitTags fruits={reflection.fruits} />
        </header>

        <section>
          <h2>What happened</h2>
          <p className="prose-copy">{reflection.journalText}</p>
        </section>

        {reflection.scriptureRef ? (
          <section className="scripture-card">
            <p className="eyebrow">Rooted in</p>
            <p>{reflection.scriptureRef}</p>
          </section>
        ) : null}

        <section>
          <h2>What God is teaching me</h2>
          <p className="prose-copy">{reflection.lessonLearned}</p>
        </section>
      </article>
    </main>
  );
}
