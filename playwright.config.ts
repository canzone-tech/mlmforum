import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:32123", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node .next/standalone/server.js",
    url: "http://127.0.0.1:32123/login",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    env: { PORT: "32123", HOSTNAME: "127.0.0.1", NODE_ENV: "production" }
  }
});
