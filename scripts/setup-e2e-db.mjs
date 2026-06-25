import { spawnSync } from "node:child_process";
import { Client } from "pg";

function defaultE2eDatabaseUrl() {
  const user = process.env.USER || "postgres";
  return `postgresql://${user}@localhost:5432/abide_e2e`;
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

const databaseUrl =
  process.env.E2E_DATABASE_URL ||
  process.env.DATABASE_URL ||
  defaultE2eDatabaseUrl();
const targetUrl = new URL(databaseUrl);
const databaseName = decodeURIComponent(targetUrl.pathname.slice(1));

if (!databaseName) {
  throw new Error("The E2E database URL must include a database name.");
}

const maintenanceUrl = new URL(targetUrl);
maintenanceUrl.pathname = "/postgres";

const client = new Client({ connectionString: maintenanceUrl.toString() });

try {
  await client.connect();
  const existingDatabase = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName],
  );

  if (!existingDatabase.rowCount) {
    await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
  }
} catch (error) {
  console.error(
    `Unable to prepare the E2E database "${databaseName}". ` +
      "Set E2E_DATABASE_URL to a PostgreSQL role that can connect to the postgres maintenance database.",
  );
  throw error;
} finally {
  await client.end().catch(() => undefined);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  env: {
    ...process.env,
    DATABASE_URL: databaseUrl,
  },
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
