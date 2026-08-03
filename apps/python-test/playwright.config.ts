import { defineConfig } from "playwright/test"

// Browser smoke suite for the quiz app. Boots a real `next dev` server and
// drives it with a real Chromium instance (run `npm run setup:playwright` once
// to install its binary). The app's basePath is "/python-test", so specs
// navigate to that prefix and exercise the same route shape as production.
const PORT = process.env.SMOKE_PORT ?? "3412"
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
    url: `${BASE_URL}/python-test/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
})
