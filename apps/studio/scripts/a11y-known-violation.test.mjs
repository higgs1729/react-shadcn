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
// WHY THIS TEST HAS A CONTROL RUN
// The story renders in a real browser (vitest browser mode -> Playwright), so a
// non-zero exit proves almost nothing on its own: a missing browser, an
// unresolvable import, or a typo in the path all produce one too. The earlier
// version asserted only "exit != 0" plus a loose /image-alt|a11y|accessib/i
// match - and `a11y` appears in the fixture's own path, so any error output
// that echoed the filename would have satisfied it. That is the same
// passes-for-the-wrong-reason shape as the gen-flow-routes path bug.
//
// So: the enforced run must fail AND name the axe rule. If it does not, the
// same story is re-run with enforcement off (VITE_SB_A11Y_MODE=todo, where the
// violation is reported but not fatal). That control separates "this machine
// cannot run browser stories at all" from "the a11y check stopped firing", and
// the failure message says which.
//
// Run: npm run test:a11y-known-violation   (needs: npm run setup:playwright)
import { test } from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"

const REL = "components/a11y-fixtures/known-violation.stories.tsx"

/** The exact command the `a11y` check ID resolves to, with the mode swapped. */
function runStory(a11yMode) {
  const result = spawnSync("npx", ["vitest", "run", "--project=storybook", REL], {
    shell: true,
    encoding: "utf8",
    env: { ...process.env, VITE_SB_A11Y_MODE: a11yMode },
  })
  return { status: result.status, output: `${result.stdout ?? ""}${result.stderr ?? ""}` }
}

const tail = (output, n = 25) =>
  output
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .slice(-n)
    .join("\n")

test(
  "the a11y check still fails on a known violation (image-alt)",
  { timeout: 240_000 },
  () => {
    const enforced = runStory("error")

    // Fast path: the check fired and named the rule. One browser run, as before.
    if (enforced.status !== 0 && /image-alt/.test(enforced.output)) return

    // Anything else needs a diagnosis, so pay for a second run to get one.
    const control = runStory("todo")

    assert.equal(
      control.status,
      0,
      "ENVIRONMENT, not a11y: the fixture story cannot run even with the a11y check " +
        "disabled, so this says nothing about accessibility. The usual cause is a missing " +
        "Playwright browser - run `npm run setup:playwright` locally, or install chromium " +
        `in CI before \`npm run checks\`.\n\ncontrol run (VITE_SB_A11Y_MODE=todo):\n${tail(control.output)}`,
    )

    assert.notEqual(
      enforced.status,
      0,
      "The browser works (the control run passed) but the a11y check no longer fails on a " +
        "deliberate image-alt violation. The `a11y` check ID is no longer enforcing anything.\n\n" +
        `enforced run (VITE_SB_A11Y_MODE=error):\n${tail(enforced.output)}`,
    )

    assert.match(
      enforced.output,
      /image-alt/,
      "The enforced run failed, but its output never names the `image-alt` axe rule, so the " +
        "failure cannot be attributed to the planted violation. Matching on a looser pattern " +
        "is not a fix: `a11y` occurs in this fixture's own path.\n\n" +
        `enforced run:\n${tail(enforced.output)}`,
    )
  },
)
