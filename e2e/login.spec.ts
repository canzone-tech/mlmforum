import {expect,test} from "@playwright/test";
test("login is server-authenticated, user role comes from database",async({page})=>{
 await page.goto("/login");
 await expect(page.getByRole("heading",{name:"Your next opportunity starts with community."})).toBeVisible();
 await expect(page.locator("#role")).toHaveCount(0);
 await expect(page.locator(".credential-grid")).toHaveCount(0);
 await page.locator("#email").fill("test-member@mlmforum.invalid");
 await page.locator("#password").fill("Integration-Test-Password-Only-123!");
 await page.getByRole("button",{name:"Login →"}).click();
 await expect(page).toHaveURL(/\/dashboard$/);
 await expect(page.getByRole("heading",{name:"Welcome, Test Member"})).toBeVisible();
 await expect(page.getByText("MEMBER",{exact:false})).toBeVisible();
 await page.getByRole("button",{name:"Logout"}).click();
 await expect(page).toHaveURL(/\/login$/);
 await page.goto("/dashboard");
 await expect(page.getByRole("heading",{name:"Login required"})).toBeVisible();
});
test("bad password never creates authentication",async({page})=>{
 await page.goto("/login");
 await page.locator("#email").fill("test-member@mlmforum.invalid");
 await page.locator("#password").fill("invalid-value");
 await page.getByRole("button",{name:"Login →"}).click();
 await expect(page.locator("#loginMsg")).toContainText("Incorrect email or password");
 await expect(page).toHaveURL(/\/login$/);
});
test("real sponsor lookup and registration create pending request",async({page})=>{
 await page.goto("/login?tab=register");
 await expect(page.getByRole("tab",{name:"Create Account"})).toHaveAttribute("aria-selected","true");
 await page.locator("#sponsorId").fill("test-sponsor-1");
 await expect(page.locator("#sponsorName")).toHaveValue("Test Sponsor");
 await page.locator("#fullName").fill("Browser Intake Test");
 await page.locator("#newEmail").fill("test-registration@mlmforum.invalid");
 await page.locator("#mobileNo").fill("9876543214");
 await page.locator("#newRole").selectOption("business");
 await page.locator("input[name=consent]").check();
 await page.getByRole("button",{name:"Create Account"}).click();
 await expect(page.locator("#registerMsg")).toContainText("Registration request received");
 await expect(page.locator("#sponsorName")).toHaveValue("");
 await expect(page).toHaveURL(/\/login\?tab=register$/);
});
test("invalid sponsor fails closed",async({page})=>{
 await page.goto("/login?tab=register");
 await page.locator("#sponsorId").fill("UNKNOWN-123");
 await expect(page.locator("#sponsorHelp")).toContainText("not found");
 await expect(page.locator("#sponsorName")).toHaveValue("");
});
for(const width of [390,320]){
 test(`auth mobile ${width}px stays readable without overflow`,async({page})=>{
  await page.setViewportSize({width,height:850});
  await page.goto("/login");
  await expect(page.locator(".auth-card")).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  await page.getByRole("tab",{name:"Create Account"}).click();
  await expect(page.locator("#registerForm")).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 });
}
