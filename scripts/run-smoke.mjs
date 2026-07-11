// Runs the golden-flow browser smoke suite (e2e/golden-flow.smoke.spec.ts) via
// Playwright, after verifying its Chromium binary is actually installed.
// Per task-12-runtime-quality-and-security.md's constraint: a missing browser
// binary must fail loudly with setup guidance, never be silently skipped.
//
// Run: npm run test:smoke
import { spawnSync } from "node:child_process"
import { chromium } from "playwright"

// Authoritative check: try to actually launch the installed Chromium binary
// and close it immediately. `playwright install --dry-run` only prints the
// install plan and exits 0 regardless of whether the binary is present, so
// it cannot be used as a gate; a real launch attempt is the only reliable
// signal short of reaching into Playwright's internal registry module.
try {
  const browser = await chromium.launch()
  await browser.close()
} catch (error) {
  console.error(
    [
      "CLASSIFIED environment failure (classification: environment): Playwright's Chromium binary could not be launched.",
      "",
      "Setup guidance:",
      "  npm run setup:playwright",
      "  (equivalent: npx playwright install chromium)",
      "",
      "Refusing to silently skip the browser smoke suite.",
      "",
      String(error?.message ?? error),
    ].join("\n"),
  )
  process.exit(1)
}

const result = spawnSync("npx", ["playwright", "test", "-c", "playwright.config.ts"], {
  shell: true,
  stdio: "inherit",
})

process.exit(result.status ?? 1)
