import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReflectionForm } from "@/components/reflection-form";
import {
  dateKeyToUtc,
  formatReflectionDate,
  getDateKey,
} from "@/lib/dates";
import { getTodayReflection } from "@/lib/reflections";

export const metadata: Metadata = {
  title: "Today’s reflection",
};

export default async function NewReflectionPage() {
  const existingReflection = await getTodayReflection();

  if (existingReflection) {
    redirect(`/reflections/${existingReflection.id}`);
  }

  return (
    <main className="page-shell narrow-shell">
      <Link className="back-link" href="/">
        ← Dashboard
      </Link>
      <header className="page-heading">
        <p className="eyebrow">
          {formatReflectionDate(dateKeyToUtc(getDateKey()))}
        </p>
        <h1>Notice what is growing.</h1>
        <p>
          Take a quiet moment to look back on the day. This is a record of
          grace, not a scorecard.
        </p>
      </header>
      <ReflectionForm />
    </main>
  );
}
