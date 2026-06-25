import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";

const databaseUrl =
  process.env.E2E_DATABASE_URL ||
  process.env.DATABASE_URL ||
  `postgresql://${process.env.USER || "postgres"}@localhost:5432/abide_e2e`;
const appTimeZone = process.env.APP_TIME_ZONE || "Europe/London";

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

function monthLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateKey(date)}T00:00:00.000Z`));
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

async function resetReflections() {
  await withDatabase((client) => client.query('DELETE FROM "FruitReflection"'));
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
        "A duplicate reflection was already saved for this calendar day.",
        "Galatians 5:22-23",
        "God is teaching me to receive the day with peace.",
      ],
    ),
  );

  return id;
}

async function fillReflectionForm(
  page: Page,
  values: {
    journalText: string;
    lessonLearned: string;
    prayerNote?: string;
    scriptureRef?: string;
  },
) {
  await page.locator('textarea[name="journalText"]').fill(values.journalText);
  await page.getByLabel("Love").check();
  await page.getByLabel("Peace").check();
  await page.locator('input[name="scriptureRef"]').fill(values.scriptureRef ?? "");
  await page.locator('textarea[name="lessonLearned"]').fill(values.lessonLearned);
  await page.locator('textarea[name="prayerNote"]').fill(values.prayerNote ?? "");
}

test.beforeEach(async () => {
  await resetReflections();
});

test("covers the reflection lifecycle across routes and server actions", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "How is God changing you?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your reflection is still open." }),
  ).toBeVisible();
  await expect(
    page.getByText("Recent reflections will gather here"),
  ).toBeVisible();

  await page.getByRole("link", { name: "Reflect on today" }).click();
  await expect(
    page.getByRole("heading", { name: "Notice what is growing." }),
  ).toBeVisible();

  await page
    .locator('textarea[name="journalText"]')
    .evaluate((field) => field.removeAttribute("minlength"));
  await page
    .locator('textarea[name="lessonLearned"]')
    .evaluate((field) => field.removeAttribute("minlength"));
  await page.locator('textarea[name="journalText"]').fill("Brief");
  await page.locator('textarea[name="lessonLearned"]').fill("Few");
  await page.getByRole("button", { name: "Save today’s reflection" }).click();

  await expect(
    page.getByText("A few details need your attention."),
  ).toBeVisible();
  await expect(
    page.getByText("Write a little more about what happened today."),
  ).toBeVisible();
  await expect(
    page.getByText("Choose at least one fruit that was present."),
  ).toBeVisible();
  await expect(
    page.getByText("Share a little about what God is teaching you."),
  ).toBeVisible();

  await seedTodayReflection();
  await fillReflectionForm(page, {
    journalText: "I noticed love and peace in a hard conversation today.",
    scriptureRef: "Galatians 5:22-23",
    lessonLearned: "God is teaching me to listen before I answer.",
    prayerNote: "Help me carry that peace into tomorrow.",
  });
  await page.getByRole("button", { name: "Save today’s reflection" }).click();

  await expect(
    page.getByText("Today’s reflection already exists. Open it from the dashboard."),
  ).toBeVisible();

  await resetReflections();
  await page.goto("/reflections/new");
  await fillReflectionForm(page, {
    journalText: "I noticed love and peace in a hard conversation today.",
    scriptureRef: "Galatians 5:22-23",
    lessonLearned: "God is teaching me to listen before I answer.",
    prayerNote: "Help me carry that peace into tomorrow.",
  });
  await page.getByRole("button", { name: "Save today’s reflection" }).click();

  await expect(page).toHaveURL(/\/reflections\/(?!new$)[^/]+$/);
  const detailUrl = page.url();
  await expect(
    page.getByRole("heading", { name: "A moment of growth." }),
  ).toBeVisible();
  await expect(page.getByText("I noticed love and peace")).toBeVisible();
  await expect(page.getByText("Rooted in")).toBeVisible();
  await expect(page.getByText("Galatians 5:22-23")).toBeVisible();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(
    page.getByRole("heading", { name: "You made space to reflect." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Read today’s reflection" }),
  ).toBeVisible();

  await page.goto("/reflections/new");
  await expect(page).toHaveURL(detailUrl);

  await page.getByRole("link", { name: "Edit reflection" }).click();
  await page
    .locator('textarea[name="journalText"]')
    .fill("Updated: love and peace were present in a hard conversation today.");
  await page
    .locator('textarea[name="lessonLearned"]')
    .fill("God is teaching me to listen with patience before I answer.");
  await page.getByRole("button", { name: "Update reflection" }).click();

  await expect(page).toHaveURL(detailUrl);
  await expect(page.getByText("Updated: love and peace")).toBeVisible();
  await expect(
    page.getByText("listen with patience before I answer"),
  ).toBeVisible();

  await page.goto("/reflections/timeline");
  await expect(page.getByText("1 reflection found")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: monthLabel() }),
  ).toBeVisible();
  await expect(page.getByText("Updated: love and peace")).toBeVisible();

  await page.goto(detailUrl);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete reflection" }).click();

  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { name: "Your reflection is still open." }),
  ).toBeVisible();
  await expect(
    page.getByText("Recent reflections will gather here"),
  ).toBeVisible();
  await withDatabase(async (client) => {
    const result = await client.query('SELECT COUNT(*)::int AS count FROM "FruitReflection"');
    expect(result.rows[0].count).toBe(0);
  });
});

test.describe("without client-side JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("saves a reflection through the progressive-enhancement form", async ({
    page,
  }) => {
    await page.goto("/reflections/new");
    await fillReflectionForm(page, {
      journalText: "Peace was present while I made room to listen today.",
      lessonLearned: "God is teaching me to stay attentive in ordinary moments.",
    });
    await page.getByRole("button", { name: "Save today’s reflection" }).click();

    await expect(page).toHaveURL(/\/reflections\/(?!new$)[^/]+$/);
    await expect(
      page.getByRole("heading", { name: "A moment of growth." }),
    ).toBeVisible();
    await expect(page.getByText("Peace was present")).toBeVisible();
  });
});
