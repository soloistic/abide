import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  description:
    "You are offline. Your reflections are kept safely and will be here when you return.",
};

export default function OfflinePage() {
  return (
    <main className="page-shell narrow-shell">
      <p className="eyebrow">Abide</p>
      <div className="page-heading">
        <h1>You are offline.</h1>
        <p>
          Nothing is lost. Your reflections are kept safely, and you can
          return to them when you are reconnected.
        </p>
      </div>
      <Link className="button button-primary" href="/">
        Try again
      </Link>
    </main>
  );
}
