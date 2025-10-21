import { test, expect } from "@playwright/test";

test.describe("Issues", () => {
  test("should redirect to login when accessing issues without auth", async ({
    page,
  }) => {
    await page.goto("/issues");
    // Should redirect to login page
    await expect(page).toHaveURL("/login");
  });

  test("should redirect to login when accessing new issue without auth", async ({
    page,
  }) => {
    await page.goto("/issues/new");
    // Should redirect to login page since not authenticated
    await expect(page).toHaveURL("/login");
  });

  test("should complete signup flow and access issues dashboard", async ({
    page,
  }) => {
    await page.goto("/signup");

    // Fill form with unique test data
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "TestPassword123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to issues page after successful signup
    await expect(page).toHaveURL("/issues");

    // Should show issues dashboard
    await expect(page.locator("h1")).toContainText("Issues Dashboard");
  });

  test("should show new issue form after authentication", async ({ page }) => {
    // First create an account
    await page.goto("/signup");
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    // Should be on issues page
    await expect(page).toHaveURL("/issues");

    // Navigate to new issue
    await page.click("text=New Issue");
    await expect(page).toHaveURL("/issues/new");

    // Check form elements
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
