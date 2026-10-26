import Link from "next/link";
import { LogoutForm } from "@/components/logout-form";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/reflections/timeline", label: "Fruit timeline" },
  { href: "/prayers", label: "Prayers" },
  { href: "/testimonies", label: "Testimonies" },
  { href: "/settings", label: "Settings" },
] as const;

export function SiteHeader({
  currentHref,
  tagline = false,
}: {
  currentHref?: (typeof NAV_LINKS)[number]["href"];
  tagline?: boolean;
}) {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/">
        Abide
      </Link>
      <nav className="header-nav" aria-label="Primary navigation">
        {NAV_LINKS.filter((link) => link.href !== currentHref).map((link) => (
          <Link className="header-link" href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
        <LogoutForm />
        {tagline ? <span>A quiet record of transformation</span> : null}
      </nav>
    </header>
  );
}
