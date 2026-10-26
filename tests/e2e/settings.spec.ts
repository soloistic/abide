import { expect, test, type Page } from "@playwright/test";

const e2eUsername = process.env.ABIDE_AUTH_USERNAME || "abide-e2e";
const e2ePassword = process.env.ABIDE_AUTH_PASSWORD || "abide-e2e-password";

async function signIn(page: Page, next = "/") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.locator('input[name="username"]').fill(e2eUsername);
  await page.locator('input[name="password"]').fill(e2ePassword);
  await page.getByRole("button", { name: "Open journal" }).click();
  await expect(page).toHaveURL(next);
}

test("keeps settings behind the single-user session", async ({ page }) => {
  await page.goto("/settings");

  await expect(page).toHaveURL(/\/login\?next=%2Fsettings$/);
});

test("offers the reminder and install cards without configured push", async ({
  page,
}) => {
  await signIn(page, "/settings");

  await expect(
    page.getByRole("heading", { name: "Settings", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "An evening invitation" }),
  ).toBeVisible();
  await expect(
    page.getByText("It is an invitation, not a streak or a score."),
  ).toBeVisible();

  // The e2e environment has no VAPID keys, so the reminder card explains that
  // reminders are optional instead of offering to enable them.
  await expect(
    page.getByText("Reminders are not configured yet."),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Install Abide" }),
  ).toBeVisible();
});
