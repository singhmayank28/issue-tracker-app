import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("should show login form elements", async ({ page }) => {
    await page.goto("/login");

    // Check page title and form elements
    await expect(page.locator("h2")).toContainText("Welcome Back");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText(
      "Sign In"
    );
  });

  test("should show signup form elements", async ({ page }) => {
    await page.goto("/signup");

    // Check page title and form elements
    await expect(page.locator("h2")).toContainText("Join Us Today");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText(
      "Create Account"
    );
  });

  test("should toggle between login and signup", async ({ page }) => {
    await page.goto("/login");

    // Click signup link
    await page.click("text=Sign up");
    await expect(page).toHaveURL("/signup");

    // Click login link
    await page.click("text=Sign in");
    await expect(page).toHaveURL("/login");
  });

  test("should show validation error for empty fields", async ({ page }) => {
    await page.goto("/login");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show HTML5 validation messages
    const emailInput = page.locator('input[name="email"]');
    const isEmailInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isEmailInvalid).toBe(true);
  });
});
