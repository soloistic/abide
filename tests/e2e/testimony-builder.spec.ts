import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";

const databaseUrl =
  process.env.E2E_DATABASE_URL ||
  process.env.DATABASE_URL ||
  `postgresql://${process.env.USER || "postgres"}@localhost:5432/abide_e2e`;
const appTimeZone = process.env.APP_TIME_ZONE || "Europe/London";
const e2eUsername = process.env.ABIDE_AUTH_USERNAME || "abide-e2e";
const e2ePassword = process.env.ABIDE_AUTH_PASSWORD || "abide-e2e-password";

function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: appTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

async function withDatabase<T>(callback: (client: Client) => Promise<T>) {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

async function resetJournal() {
  await withDatabase((client) =>
    client.query(
      'DELETE FROM "TestimonyDraft"; DELETE FROM "FruitReflection";',
    ),
  );
}

async function signIn(page: Page, next = "/") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.locator('input[name="username"]').fill(e2eUsername);
  await page.locator('input[name="password"]').fill(e2ePassword);
  await page.getByRole("button", { name: "Open journal" }).click();
  await expect(page).toHaveURL(next);
}

async function seedTodayReflection() {
  const id = randomUUID();

  await withDatabase((client) =>
    client.query(
      `
        INSERT INTO "FruitReflection" (
          "id",
          "reflectionDate",
          "journalText",
          "fruits",
          "scriptureRef",
          "lessonLearned",
          "createdAt",
          "updatedAt"
        )
        VALUES ($1, $2, $3, ARRAY['LOVE', 'PEACE']::"Fruit"[], $4, $5, now(), now())
      `,
      [
        id,
        dateKey(),
        "I noticed love and peace in a hard conversation today.",
        "Galatians 5:22-23",
        "God is teaching me to listen before I answer.",
      ],
    ),
  );

  return id;
}

test.beforeEach(async () => {
  await resetJournal();
});

test("gathers reflections into an editable private draft", async ({
  page,
}) => {
  await seedTodayReflection();
  await signIn(page, "/testimonies/new");

  await page.locator('input[name="reflectionIds"]').first().check();
  await page.locator('input[name="theme"]').fill("learning patience");
  await page.getByRole("button", { name: "Gather into a draft" }).click();

  await expect(page).toHaveURL(/\/testimonies\/(?!new$)[^/]+$/);
  const draftUrl = page.url();
  await expect(
    page.getByRole("heading", { name: "learning patience" }),
  ).toBeVisible();
  await expect(page.getByText("Private draft")).toBeVisible();
  await expect(page.locator('textarea[name="body"]')).toHaveValue(
    /God is teaching me to listen before I answer/,
  );
  await expect(
    page.getByRole("heading", { name: "Linked reflections" }),
  ).toBeVisible();
  await expect(page.getByText("God is teaching me to listen")).toBeVisible();

  await page.locator('input[name="title"]').fill("A story of listening");
  await page
    .locator('textarea[name="body"]')
    .fill("In my own words: listening became a form of love.");
  await page.getByRole("button", { name: "Save draft" }).click();

  await expect(page).toHaveURL(draftUrl);
  await expect(
    page.getByRole("heading", { name: "A story of listening" }),
  ).toBeVisible();
  await expect(page.locator('textarea[name="body"]')).toHaveValue(
    "In my own words: listening became a form of love.",
  );

  await page.getByRole("link", { name: "Delete draft" }).click();
  await expect(page).toHaveURL(/\/testimonies\/[^/]+\/delete$/);
  await expect(
    page.getByRole("heading", { name: "Let go of this draft?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Yes, delete this draft" }).click();

  await expect(page).toHaveURL("/testimonies");
  await expect(page.getByText("No drafts yet.")).toBeVisible();
});

test.describe("without client-side JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("gathers a draft through the progressive-enhancement form", async ({
    page,
  }) => {
    await seedTodayReflection();
    await signIn(page, "/testimonies/new");

    await page.locator('input[name="reflectionIds"]').first().check();
    await page.locator('input[name="theme"]').fill("learning patience");
    await page.getByRole("button", { name: "Gather into a draft" }).click();

    await expect(page).toHaveURL(/\/testimonies\/(?!new$)[^/]+$/);
    await expect(
      page.getByRole("heading", { name: "learning patience" }),
    ).toBeVisible();
    await expect(page.locator('textarea[name="body"]')).toHaveValue(
      /God is teaching me to listen before I answer/,
    );
  });
});
