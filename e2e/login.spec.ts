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
 await expect(page.getByRole("heading",{name:/Good day, Test/})).toBeVisible();
 await expect(page.getByRole("navigation",{name:"Member modules"})).toBeVisible();
 await expect(page.getByRole("region",{name:"Your member account summary"})).toBeVisible();
 await expect(page.getByText("TEST-MEMBER-1")).toHaveCount(2);
 await expect(page.getByRole("heading",{name:"Your recent account activity"})).toBeVisible();
 await expect(page.getByRole("heading",{name:"Recommended next actions"})).toBeVisible();
 await expect(page.getByRole("link",{name:/Genealogy Tree/})).toHaveCount(1);
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

test("member dashboard mobile navigation opens and closes accessibly",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/login");
 await page.locator("#email").fill("test-member@mlmforum.invalid");
 await page.locator("#password").fill("Integration-Test-Password-Only-123!");
 await page.getByRole("button",{name:"Login →"}).click();
 await expect(page).toHaveURL(/\/dashboard$/);
 const menu=page.getByRole("button",{name:"Toggle workspace menu"});
 await expect(menu).toHaveAttribute("aria-expanded","false");
 await menu.click();
 await expect(menu).toHaveAttribute("aria-expanded","true");
 await expect(page.getByRole("navigation",{name:"Member modules"})).toBeVisible();
 await expect(page.getByText("Genealogy Tree")).toBeVisible();
 await page.getByRole("button",{name:"Close workspace menu"}).click();
 await expect(menu).toHaveAttribute("aria-expanded","false");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
test("member dashboard does not expose private profile data to guests",async({page})=>{
 await page.goto("/dashboard");
 await expect(page.getByRole("heading",{name:"Login required"})).toBeVisible();
 await expect(page.getByText("TEST-MEMBER-1")).toHaveCount(0);
 const response=await page.request.get("/api/member/overview");
 expect(response.status()).toBe(401);
});

test("member genealogy reads own confirmed network, filters by level and resets",async({page})=>{
 await page.goto("/login");
 await page.locator("#email").fill("test-member@mlmforum.invalid");
 await page.locator("#password").fill("Integration-Test-Password-Only-123!");
 await page.getByRole("button",{name:"Login →"}).click();
 await expect(page).toHaveURL(/\/dashboard$/);
 await page.getByRole("link",{name:/Genealogy Tree/}).click();
 await expect(page).toHaveURL(/\/dashboard\/genealogy$/);
 await expect(page.getByRole("heading",{name:"MLM Genealogy — Level Plan 1:10"})).toBeVisible();
 await expect(page.getByText("TEST-MEMBER-1")).toBeVisible();
 await expect(page.getByRole("button",{name:/Downline Alpha/})).toBeVisible();
 await expect(page.getByRole("button",{name:/Downline Beta/})).toBeVisible();
 await expect(page.getByRole("button",{name:/Downline Gamma/})).toBeVisible();
 await page.getByRole("combobox",{name:"Choose genealogy level"}).selectOption("2");
 await expect(page.getByRole("button",{name:/Downline Alpha/})).toHaveCount(0);
 await expect(page.getByRole("button",{name:/Downline Gamma/})).toBeVisible();
 await page.getByRole("combobox",{name:"Choose genealogy level"}).selectOption("all");
 await page.getByRole("textbox",{name:"Search displayed member ID or name"}).fill("DOWNLINE BETA");
 await page.getByRole("button",{name:"Search",exact:true}).click();
 await expect(page.getByRole("button",{name:/Downline Beta/})).toBeVisible();
 await expect(page.getByRole("button",{name:/Downline Alpha/})).toHaveCount(0);
 await page.getByRole("button",{name:"Reset view"}).click();
 await expect(page.getByRole("button",{name:/Downline Alpha/})).toBeVisible();
 await expect(page.getByRole("button",{name:/Downline Gamma/})).toBeVisible();
 await page.getByRole("button",{name:/Downline Alpha/}).click();
 await expect(page.getByText(/Selected member: TEST-CHILD-A/)).toBeVisible();
});
test("guests do not access genealogy records",async({page})=>{
 await page.goto("/dashboard/genealogy");
 await expect(page.getByRole("heading",{name:"Login required"})).toBeVisible();
 expect((await page.request.get("/api/member/genealogy")).status()).toBe(401);
});
test("mobile genealogy grid fits viewport and member sidebar stays navigable",async({page})=>{
 await page.setViewportSize({width:390,height:850});
 await page.goto("/login");
 await page.locator("#email").fill("test-member@mlmforum.invalid");
 await page.locator("#password").fill("Integration-Test-Password-Only-123!");
 await page.getByRole("button",{name:"Login →"}).click();
 await page.getByRole("button",{name:"Toggle workspace menu"}).click();
 await page.getByRole("link",{name:/Genealogy Tree/}).click();
 await expect(page).toHaveURL(/\/dashboard\/genealogy$/);
 await expect(page.getByRole("heading",{name:"LEVEL 1 — DIRECT MEMBERS"})).toBeVisible();
 await expect(page.getByRole("button",{name:/Downline Alpha/})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
