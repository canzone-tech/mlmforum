import test from "node:test";
import assert from "node:assert/strict";
import {
  demoUsers, demoSponsors, demoRegistrationRoles,
  isDemoRole, getSponsorName, validIndianMobile, matchesDemoCredentials
} from "../config/demo.ts";
test("client source defines exactly seven distinct demo role emails", () => {
  const roles = Object.keys(demoUsers);
  assert.deepEqual(roles, ["member","business","expert","organizer","advertiser","moderator","admin"]);
  assert.equal(new Set(roles.map(role => demoUsers[role].email)).size, 7);
  assert.deepEqual(demoRegistrationRoles, roles.slice(0, 5));
});
test("matching role credentials validate only demo values", () => {
  for (const [role, user] of Object.entries(demoUsers)) {
    assert.equal(matchesDemoCredentials(role, user.email, "Demo@123"), true);
    assert.equal(matchesDemoCredentials(role, user.email, "wrong"), false);
    assert.equal(matchesDemoCredentials(role, "not-the-user@example.com", "Demo@123"), false);
  }
  assert.equal(matchesDemoCredentials("admin", demoUsers.member.email, "Demo@123"), false);
  assert.equal(isDemoRole("__proto__"), false);
  assert.equal(isDemoRole("unknown"), false);
});
test("sponsor names resolve exactly ten reference fixtures, not arbitrary IDs", () => {
  assert.equal(Object.keys(demoSponsors).length, 10);
  assert.equal(getSponsorName(" mlm-1001 "), "Ravi Kumar");
  assert.equal(getSponsorName("MLM-1010"), "Fatima Khan");
  assert.equal(getSponsorName("MLM-9999"), undefined);
  assert.equal(getSponsorName("__proto__"), undefined);
});
test("client Indian mobile example validation", () => {
  assert.equal(validIndianMobile("9876543210"), true);
  assert.equal(validIndianMobile("6123456789"), true);
  assert.equal(validIndianMobile("5123456789"), false);
  assert.equal(validIndianMobile("123456789"), false);
  assert.equal(validIndianMobile("98765432101"), false);
  assert.equal(validIndianMobile("98765 43210"), false);
});
