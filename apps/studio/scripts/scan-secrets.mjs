// Local, deterministic, credential-free secret scanner (task-12
// requirement 3). No hosted service, no network call: it enumerates
// git-tracked files (`git ls-files`, so it automatically respects
// .gitignore and never touches node_modules/.next build output) and greps
// their text content against a fixed set of high-confidence secret patterns.
//
// A match fails the command unless it is listed in the baseline allowlist
// (scripts/fixtures/secrets-baseline.json) - the mechanism for a reviewed
// false positive. There is no fuzzy/entropy scoring: every pattern here is a
// recognizable credential shape (cloud key prefix, token prefix, PEM header,
// or an explicit secret/token/password assignment), so any unlisted match is
// treated as high-severity and fails the run.
//
// Run: npm run scan:secrets
import { execFileSync } from "node:child_process"
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const ROOT = process.cwd()
const BASELINE_PATH = join(ROOT, "scripts", "fixtures", "secrets-baseline.json")

// docs/archive/ is out of scope for every executor in this repo (see
// docs/tasks/README.md ground rules) and package-lock.json is dependency
// metadata, not source, with a very high false-positive rate for
// generic-assignment style patterns (integrity hashes, resolved URLs).
const EXCLUDE_PATH_PREFIXES = ["docs/archive/"]
const EXCLUDE_EXACT_PATHS = new Set(["package-lock.json"])

const PATTERNS = [
  { id: "aws-access-key-id", severity: "high", re: /AKIA[0-9A-Z]{16}/g },
  {
    id: "aws-secret-access-key",
    severity: "high",
    re: /aws_secret_access_key\s*[:=]\s*['"][A-Za-z0-9/+=]{40}['"]/gi,
  },
  { id: "github-token", severity: "high", re: /gh[pousr]_[A-Za-z0-9]{36,255}/g },
  { id: "slack-token", severity: "high", re: /xox[baprs]-[0-9A-Za-z-]{10,48}/g },
  { id: "google-api-key", severity: "high", re: /AIza[0-9A-Za-z_-]{35}/g },
  {
    id: "private-key-block",
    severity: "high",
    re: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  },
  {
    id: "generic-secret-assignment",
    severity: "high",
    re: /(api[_-]?key|secret|password|token)["']?\s*[:=]\s*["'][A-Za-z0-9._-]{16,}["']/gi,
  },
]

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return []
  return JSON.parse(readFileSync(BASELINE_PATH, "utf8"))
}

function isBaselined(baseline, file, patternId, match) {
  return baseline.some(
    (entry) => entry.file === file && entry.patternId === patternId && entry.match === match,
  )
}

function isProbablyBinary(buffer) {
  const len = Math.min(buffer.length, 8000)
  for (let i = 0; i < len; i++) {
    if (buffer[i] === 0) return true
  }
  return false
}

function trackedFiles() {
  const out = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" })
  return out
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((f) => !EXCLUDE_EXACT_PATHS.has(f))
    .filter((f) => !EXCLUDE_PATH_PREFIXES.some((prefix) => f.startsWith(prefix)))
}

const baseline = loadBaseline()
const findings = []
const files = trackedFiles()

for (const file of files) {
  const abs = join(ROOT, file)
  let buffer
  try {
    buffer = readFileSync(abs)
  } catch {
    continue // unreadable (e.g. broken symlink); skip rather than crash the scan
  }
  if (isProbablyBinary(buffer)) continue
  const text = buffer.toString("utf8")

  for (const pattern of PATTERNS) {
    for (const match of text.matchAll(pattern.re)) {
      const value = match[0]
      if (isBaselined(baseline, file, pattern.id, value)) continue
      findings.push({ file, patternId: pattern.id, severity: pattern.severity, match: value })
    }
  }
}

if (findings.length === 0) {
  console.log(`scan:secrets: OK - ${files.length} tracked files scanned, 0 unbaselined findings.`)
  process.exit(0)
}

console.error(`scan:secrets: FAIL - ${findings.length} unbaselined finding(s):\n`)
for (const f of findings) {
  console.error(`  [${f.severity}] ${f.file} (${f.patternId}): ${f.match}`)
}
console.error(
  "\nIf a finding is a reviewed false positive, add it to scripts/fixtures/secrets-baseline.json " +
    "(file, patternId, match) - do not weaken a pattern to silence a real credential shape.",
)
process.exit(1)
