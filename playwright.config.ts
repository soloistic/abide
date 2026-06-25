import { defineConfig, devices } from "@playwright/test";

function defaultE2eDatabaseUrl() {
  const user = process.env.USER || "postgres";
  return `postgresql://${user}@localhost:5432/abide_e2e`;
}

const databaseUrl =
  process.env.E2E_DATABASE_URL ||
  process.env.DATABASE_URL ||
  defaultE2eDatabaseUrl();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- -H 127.0.0.1 -p 3001",
    env: {
      ABIDE_AUTH_PASSWORD:
        process.env.ABIDE_AUTH_PASSWORD || "abide-e2e-password",
      ABIDE_AUTH_USERNAME: process.env.ABIDE_AUTH_USERNAME || "abide-e2e",
      ABIDE_SESSION_SECRET:
        process.env.ABIDE_SESSION_SECRET ||
        "abide-e2e-session-secret-with-local-only-entropy",
      APP_TIME_ZONE: process.env.APP_TIME_ZONE || "Europe/London",
      DATABASE_URL: databaseUrl,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://127.0.0.1:3001",
  },
});
