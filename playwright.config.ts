import { defineConfig } from "playwright/test"

// Browser smoke suite for the golden flow (task-12-runtime-quality-and-security.md).
// Boots a real `next dev` server and drives the three golden routes with a real
// Chromium instance (Playwright, already a devDependency; run `npm run
// setup:playwright` once to install its Chromium binary). This is deliberately
// separate from vitest.config.ts's `storybook` project: that project mounts
// isolated component stories, this one exercises the actual Next.js routes
// (App Router layout, navigation, real page composition) end to end.
const PORT = process.env.SMOKE_PORT ?? "3411"
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "off",
  },
  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
})
