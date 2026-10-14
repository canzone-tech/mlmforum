import {expect,test} from "@playwright/test";

test("real login form never offers role switching or hardcoded credentials",async({page})=>{
  await page.goto("/login",{waitUntil:"domcontentloaded"});
  await expect(page.getByRole("heading",{name:"Your next opportunity starts with community."})).toBeVisible();
  await expect(page.getByRole("tab",{name:"Login"})).toHaveAttribute("aria-selected","true");
  await expect(page.locator("#email")).toBeEmpty();
  await expect(page.locator("#password")).toBeEmpty();
  await expect(page.locator("#role")).toHaveCount(0);
  await expect(page.locator(".credential-grid")).toHaveCount(0);
});
test("unavailable API cannot issue login or grant a role",async({page})=>{
  await page.route("**/api/auth/login",async route=>
    route.fulfill({status:503,contentType:"application/json",body:'{"message":"unavailable"}'}));
  await page.goto("/login");
  await page.locator("#email").fill("user@example.com");
  await page.locator("#password").fill("not-a-real-credential");
  await page.locator("#loginForm button[type=submit]").click();
  await expect(page.locator("#loginMsg")).toContainText("Service is not available yet");
  await expect(page).toHaveURL(/\/login$/);
});
test("sponsor name comes from API, registration never reports success on API failure",async({page})=>{
  await page.route("**/api/sponsors/MLM-1001",async route=>
    route.fulfill({status:200,contentType:"application/json",body:'{"name":"Verified Sponsor"}'}));
  await page.route("**/api/auth/register",async route=>
    route.fulfill({status:503,contentType:"application/json",body:'{"message":"unavailable"}'}));
  await page.goto("/login?tab=register");
  await expect(page.getByRole("tab",{name:"Create Account"})).toHaveAttribute("aria-selected","true");
  await page.locator("#sponsorId").fill("MLM-1001");
  await expect(page.locator("#sponsorName")).toHaveValue("Verified Sponsor");
  await page.locator("#fullName").fill("Test Person");
  await page.locator("#newEmail").fill("test@example.com");
  await page.locator("#mobileNo").fill("9876543210");
  await page.locator("input[name=consent]").check();
  await page.getByRole("button",{name:"Create Account"}).click();
  await expect(page.locator("#registerMsg")).toContainText("Service is not available yet");
  await expect(page).toHaveURL(/\/login\?tab=register$/);
});
test("non-JSON missing sponsor endpoint fails closed",async({page})=>{
  await page.goto("/login?tab=register");
  await page.locator("#sponsorId").fill("MLM-1001");
  await expect(page.locator("#sponsorHelp")).toContainText("unavailable");
  await expect(page.locator("#sponsorName")).toHaveValue("");
});
for(const width of [390,320]){
 test(`mobile auth forms fit ${width}px`,async({page})=>{
   await page.setViewportSize({width,height:850});
   await page.goto("/login");
   await expect(page.locator(".auth-card")).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
   await page.getByRole("tab",{name:"Create Account"}).click();
   await expect(page.locator("#registerForm")).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 });
}
