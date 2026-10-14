import { spawn } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
const entry = ".next/standalone/server.js";
assert.ok(existsSync(entry), "Missing Next standalone compiled entrypoint");
const port = 32045;
const base = "http://127.0.0.1:" + port;
const child = spawn(process.execPath, [entry], {
  env: { ...process.env, PORT: String(port), HOSTNAME: "127.0.0.1", NODE_ENV: "production" },
  stdio: ["ignore", "pipe", "pipe"]
});
let output = "";
for (const stream of [child.stdout, child.stderr]) {
  stream.on("data", chunk => { output += String(chunk); });
}
try {
  let ready = false;
  for (let i = 0; i < 50; i++) {
    if (child.exitCode !== null) throw new Error("Compiled server exited early: " + output);
    try {
      const response = await fetch(base + "/login");
      if (response.ok) { ready = true; break; }
    } catch (error) {
      if (child.exitCode !== null) throw error;
    }
    await pause(300);
  }
  assert.ok(ready, "Compiled server failed readiness within 15 seconds: " + output);
  const paths = ["/", "/login", "/login?tab=register", "/login?role=admin", "/demo?role=admin", "/demo?role=unknown"];
  for (const path of paths) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path + " did not return 200");
    const body = await response.text();
    assert.match(body, /MLM COMMUNITY FORUM/, path + " missing brand");
  }
  const login = await (await fetch(base + "/login")).text();
  assert.match(login, /Sponsor ID|Welcome back/);
  // Without copied standalone assets, HTML can pass while CSS/JS return 404.
  const assets = [...login.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map(match => match[1]);
  assert.ok(assets.some(asset => asset.endsWith(".css")), "No compiled CSS asset linked");
  assert.ok(assets.some(asset => asset.endsWith(".js")), "No compiled JavaScript asset linked");
  for (const path of [assets.find(asset => asset.endsWith(".css")), assets.find(asset => asset.endsWith(".js"))]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, "Compiled static asset unavailable: " + path);
  }
  const admin = await (await fetch(base + "/demo?role=admin")).text();
  assert.match(admin, /Administrator workspace/);
  console.log("Compiled standalone startup, CSS/JS assets and route smoke passed.");
} finally {
  child.kill("SIGTERM");
  await pause(400);
  if (child.exitCode === null) child.kill("SIGKILL");
}
