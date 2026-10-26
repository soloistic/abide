import type { Metadata } from "next";
import { connection } from "next/server";
import { DailyReminder } from "@/components/daily-reminder";
import { InstallApp } from "@/components/install-app";
import { SiteHeader } from "@/components/site-header";
import { getAppTimeZone } from "@/lib/dates";
import { getPushPublicKey, pushIsConfigured } from "@/lib/push";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  await connection();

  const remindersConfigured = pushIsConfigured();
  const vapidPublicKey = getPushPublicKey();
  const timeZone = getAppTimeZone();
  const reminderCopy = `If you have not written a reflection by around 8:00 pm (${timeZone}), Abide can send one quiet reminder. It is an invitation, not a streak or a score.`;

  return (
    <main className="page-shell narrow-shell">
      <SiteHeader currentHref="/settings" />

      <header className="timeline-heading">
        <p className="eyebrow">A quiet rhythm</p>
        <h1>Settings</h1>
        <p>
          Choose how Abide keeps a gentle space for reflection. Notifications
          are optional, private, and can be turned off at any time.
        </p>
      </header>

      <section className="settings-card" aria-labelledby="reminder-heading">
        <div className="settings-copy">
          <p className="eyebrow">Daily reminder</p>
          <h2 id="reminder-heading">An evening invitation</h2>
          <p>
            {reminderCopy}
          </p>
        </div>
        <DailyReminder
          pushConfigured={remindersConfigured}
          vapidPublicKey={vapidPublicKey}
        />
      </section>

      <section className="settings-card" aria-labelledby="install-heading">
        <div className="settings-copy">
          <p className="eyebrow">On your device</p>
          <h2 id="install-heading">Install Abide</h2>
          <p>
            Installing Abide keeps it close at hand and lets reminders work on
            iPhone and iPad. It opens without browser clutter, like a quiet
            app.
          </p>
        </div>
        <InstallApp />
      </section>
    </main>
  );
}
