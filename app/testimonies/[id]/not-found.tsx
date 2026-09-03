import Link from "next/link";

export default function TestimonyNotFound() {
  return (
    <main className="page-shell empty-state">
      <p className="eyebrow">Draft not found</p>
      <h1>This draft may have been removed.</h1>
      <p>Return to your testimonies to continue shaping your story.</p>
      <Link className="button button-primary" href="/testimonies">
        Go to testimonies
      </Link>
    </main>
  );
}
