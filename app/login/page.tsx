import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { authIsConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";

  return (
    <main className="page-shell login-shell">
      <section className="login-panel" aria-labelledby="login-heading">
        <p className="eyebrow">Private journal</p>
        <h1 id="login-heading">Welcome back to Abide.</h1>
        <p>
          Sign in to continue reflecting and keep this record of growth private.
        </p>
        <LoginForm authConfigured={authIsConfigured()} next={next} />
      </section>
    </main>
  );
}
