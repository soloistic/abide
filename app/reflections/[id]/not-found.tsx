import Link from "next/link";

export default function ReflectionNotFound() {
  return (
    <main className="page-shell empty-state">
      <p className="eyebrow">Reflection not found</p>
      <h1>This entry may have moved.</h1>
      <p>Return to your dashboard to continue reflecting on your journey.</p>
      <Link className="button button-primary" href="/">
        Go to dashboard
      </Link>
    </main>
  );
}
