// 本番に出す。先に `npx -y wrangler@4 login` でログインしておく。
// 鍵は環境変数(OPENAI_API_KEY)と free-ai-pool の .env(OPENROUTER_API_KEY・ZAI_API_KEY)から読み、
// wrangler secret put の標準入力にだけ流す(画面・ログ・ファイルに出さない)。IP_SALT はその場で作って入れるだけ。
// 使い方: node scripts/deploy.mjs [--secrets-only]
import { execFileSync, spawn } from "node:child_process"
import { readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { randomBytes } from "node:crypto"

// 声の鍵(Gemini の有料の鍵)はユーザー環境変数 GEMINI_PAID_API_KEY。今のシェルに無ければレジストリから読む
function userEnv(name) {
  if (process.env[name]) return process.env[name]
  if (process.platform !== "win32") return undefined
  try {
    const out = execFileSync("reg", ["query", "HKCU\\Environment", "/v", name], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
    const m = out.match(new RegExp(`${name}\\s+REG_\\w+\\s+(.+)`))
    return m ? m[1].trim() : undefined
  } catch {
    return undefined
  }
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const config = join(root, "wrangler.jsonc")
const secretsOnly = process.argv.includes("--secrets-only")

const keys = { OPENAI_API_KEY: process.env.OPENAI_API_KEY }
const poolEnv = process.env.FREE_AI_POOL_ENV ?? "C:/dev/ai-compute/free-ai-pool/.env"
if (existsSync(poolEnv)) {
  for (const line of readFileSync(poolEnv, "utf8").split(/\r?\n/)) {
    const m = line.match(/^(OPENROUTER_API_KEY|ZAI_API_KEY)=(.*)$/)
    if (m) keys[m[1]] = process.env[m[1]] || m[2].trim().replace(/^["']|["']$/g, "")
  }
}
keys.GEMINI_API_KEY = userEnv("GEMINI_PAID_API_KEY")
keys.IP_SALT = randomBytes(24).toString("hex")

function wrangler(args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["-y", "wrangler@4.166.0", ...args, "--config", config], {
      cwd: root,
      stdio: [input === undefined ? "inherit" : "pipe", "inherit", "inherit"],
      shell: process.platform === "win32",
    })
    if (input !== undefined) {
      child.stdin.write(input)
      child.stdin.end()
    }
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`wrangler ${args[0]} ${args[1] ?? ""} exit ${code}`))))
  })
}

if (!secretsOnly) await wrangler(["deploy"])
for (const [name, value] of Object.entries(keys)) {
  if (!value) {
    console.log(`${name}: missing, skipped`)
    continue
  }
  await wrangler(["secret", "put", name], value)
  console.log(`${name}: put`)
}
