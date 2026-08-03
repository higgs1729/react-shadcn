// Regression coverage for scripts/scan-secrets.mjs (task-12 requirement 3):
//   1. a planted, obviously-fake secret in a temp git-tracked-shaped file is
//      still detected and fails the command;
//   2. the repository baseline (this repo's actual tracked files) scans clean.
//
// Run: node scripts/scan-secrets.test.mjs  (or npm run test:scan-secrets)
import { test } from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtempSync, writeFileSync, rmSync, cpSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ROOT = process.cwd()

test("detects a planted fake secret and fails the scan", () => {
  const dir = mkdtempSync(join(tmpdir(), "scan-secrets-"))
  try {
    // scan-secrets.mjs scans `git ls-files`, so the fixture needs its own
    // throwaway git repo with the planted secret committed.
    spawnSync("git", ["init", "-q"], { cwd: dir })
    spawnSync("git", ["config", "user.email", "test@example.com"], { cwd: dir })
    spawnSync("git", ["config", "user.name", "test"], { cwd: dir })
    writeFileSync(
      join(dir, "leaked.txt"),
      // Obviously fake, structurally valid AWS access key ID shape.
      "AWS_ACCESS_KEY_ID=AKIAABCDEFGHIJKLMNOP\n",
    )
    cpSync(join(ROOT, "scripts", "scan-secrets.mjs"), join(dir, "scan-secrets.mjs"))
    spawnSync("git", ["add", "-A"], { cwd: dir })
    spawnSync("git", ["commit", "-q", "-m", "fixture"], { cwd: dir })

    const result = spawnSync("node", ["scan-secrets.mjs"], { cwd: dir, encoding: "utf8" })

    assert.notEqual(result.status, 0, "scanner must fail when a secret-shaped string is present")
    assert.match(`${result.stdout}${result.stderr}`, /aws-access-key-id/, "must name the matched pattern")
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("this repository's tracked files scan clean on the baseline", () => {
  const result = spawnSync("node", ["scripts/scan-secrets.mjs"], { cwd: ROOT, encoding: "utf8" })
  assert.equal(result.status, 0, `expected a clean baseline scan; got:\n${result.stdout}${result.stderr}`)
})
