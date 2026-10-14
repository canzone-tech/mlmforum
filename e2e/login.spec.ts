import { expect, test } from "@playwright/test";
test("desktop login displays same client-defined tabs, roles and branding", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Your next opportunity starts with community." })).toBeVisible();
  await expect(page.getByRole("tab", {name:"Login"})).toHaveAttribute("aria-selected","true");
  await expect(page.locator("#role option")).toHaveCount(7);
  await expect(page.locator(".credential-grid button")).toHaveCount(7);
  await expect(page.getByText(/not secure authentication/)).toBeVisible();
});
test("demo role selection validates matching credentials and never implies real authentication", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator(".credential-grid button").last().click();
  await expect(page.locator("#role")).toHaveValue("admin");
  await expect(page.locator("#email")).toHaveValue("admin@mlmforum.demo");
  await page.locator("#password").fill("wrong");
  await page.locator("#loginForm button[type=submit]").click();
  await expect(page.getByText(/matching role demo account/)).toBeVisible();
  await page.locator("#password").fill("Demo@123");
  await page.locator("#loginForm button[type=submit]").click();
  await expect(page).toHaveURL(/\/demo\?role=admin$/);
  await expect(page.getByText("DEMO MODE — NO AUTHENTICATION")).toBeVisible();
  await expect(page.getByRole("heading", {name:"Administrator workspace"})).toBeVisible();
});
test("registration sponsor lookup validates sample IDs without creating an account", async ({ page }) => {
  await page.goto("/login?tab=register", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("tab",{name:"Create Account"})).toHaveAttribute("aria-selected","true");
  await page.locator("#fullName").fill("Test Person");
  await page.locator("#newEmail").fill("test@example.com");
  await page.locator("#mobileNo").fill("9876543210");
  await page.locator("#sponsorId").fill("mlm-1001");
  await expect(page.locator("#sponsorName")).toHaveValue("Ravi Kumar");
  await page.locator("input[name=consent]").check();
  await page.getByRole("button",{name:"Create Demo Account"}).click();
  await expect(page.getByText(/No account or mobile verification was created on a server/)).toBeVisible();
  await page.locator("#sponsorId").fill("MLM-9999");
  await page.getByRole("button",{name:"Create Demo Account"}).click();
  await expect(page.locator("#registerMsg")).toHaveText("Enter a valid demo Sponsor ID.");
});
for (const width of [390, 320]) {
  test(`mobile login and registration fit ${width}px without horizontal overflow`, async ({page}) => {
    await page.setViewportSize({width,height:850});
    await page.goto("/login", { waitUntil:"domcontentloaded" });
    await expect(page.locator(".auth-card")).toBeVisible();
    await expect(page.locator(".auth-art")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole("tab",{name:"Create Account"}).click();
    await expect(page.locator("#registerForm")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
