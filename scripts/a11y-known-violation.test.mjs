// Regression coverage for the `a11y` check ID's underlying mechanism
// (scripts/lib/check-registry.mjs `screenStoryCheck`, task-12 requirement 2).
// This repo currently has no pre-existing "known violation" fixture wired
// into a SelectionSpec, so this test both provides one
// (components/a11y-fixtures/known-violation.stories.tsx) and proves it is
// still caught - without adding a second a11y runner, check ID, or command:
// it runs the exact same `vitest run --project=storybook <file>` command
// with `VITE_SB_A11Y_MODE=error` that scripts/lib/check-registry.mjs's
// `resolveCheck('a11y', screen)` produces for any screen story.
//
// Run: npm run test:a11y-known-violation
import { test } from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"

test(
  "the a11y check still fails on a known violation (image-alt)",
  { timeout: 120_000 },
  () => {
    const rel = "components/a11y-fixtures/known-violation.stories.tsx"
    const result = spawnSync(
      "npx",
      ["vitest", "run", "--project=storybook", rel],
      {
        shell: true,
        encoding: "utf8",
        env: { ...process.env, VITE_SB_A11Y_MODE: "error" },
      },
    )

    assert.notEqual(result.status, 0, "the a11y-mode story run must fail on the known image-alt violation")
    const output = `${result.stdout}${result.stderr}`
    assert.match(
      output,
      /image-alt|a11y|accessib/i,
      "failure output should reference the accessibility violation",
    )
  },
)
