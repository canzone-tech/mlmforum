import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {registrationTypes,validIndianMobile,normalizeSponsorId,validSponsorFormat} from "../config/auth.ts";
test("registration options have no public admin or moderator privilege",()=>{
 assert.deepEqual(registrationTypes.map(x=>x.value),["member","business","expert","organizer","advertiser"]);
});
test("mobile and Sponsor ID syntax checks match client field expectations",()=>{
 assert.equal(validIndianMobile("9876543210"),true);
 assert.equal(validIndianMobile("5123456789"),false);
 assert.equal(normalizeSponsorId(" test-sponsor-1 "), "TEST-SPONSOR-1");
 assert.equal(validSponsorFormat("test-sponsor-1"),true);
 assert.equal(validSponsorFormat("__proto__"),false);
});
test("no client-only sign-in bypass and routes require server integration",()=>{
 assert.equal(existsSync(new URL("../config/demo.ts",import.meta.url)),false);
 assert.equal(existsSync(new URL("../app/demo/page.tsx",import.meta.url)),false);
 const page=readFileSync(new URL("../components/LoginClient.tsx",import.meta.url),"utf8");
 assert.doesNotMatch(page,/sessionStorage|chooseDemo|demoPassword|Demo@123|\?role=/);
 assert.match(page,/\/auth\/login/);
 assert.match(page,/\/auth\/register/);
 assert.match(page,/credentials:"include"/);
});
