import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {registrationTypes,validIndianMobile,normalizeSponsorId,validSponsorFormat} from "../config/auth.ts";

test("public signup offers only client-defined, non-privileged roles", () => {
  assert.deepEqual(registrationTypes.map(x=>x.value),
    ["member","business","expert","organizer","advertiser"]);
  assert.ok(!registrationTypes.some(x=>["admin","moderator"].includes(x.value)));
});
test("mobile number and sponsor syntax validation are deterministic", () => {
  assert.equal(validIndianMobile("9876543210"),true);
  assert.equal(validIndianMobile("6123456789"),true);
  assert.equal(validIndianMobile("5123456789"),false);
  assert.equal(validIndianMobile("987654321"),false);
  assert.equal(validIndianMobile("98765432101"),false);
  assert.equal(normalizeSponsorId(" mlm-1001 "), "MLM-1001");
  assert.equal(validSponsorFormat(" MLM-1001 "),true);
  assert.equal(validSponsorFormat("__proto__"),false);
  assert.equal(validSponsorFormat(""),false);
});
test("production UI does not include a credential bypass or simulated dashboard", () => {
  assert.equal(existsSync(new URL("../config/demo.ts",import.meta.url)),false);
  assert.equal(existsSync(new URL("../app/demo/page.tsx",import.meta.url)),false);
  const login=readFileSync(new URL("../components/LoginClient.tsx",import.meta.url),"utf8");
  assert.doesNotMatch(login,/sessionStorage|chooseDemo|demoPassword|Demo@123|\?role=|matchesDemoCredentials/);
  assert.match(login,/\/auth\/login/);
  assert.match(login,/\/auth\/register/);
  assert.match(login,/credentials:"include"/);
});
