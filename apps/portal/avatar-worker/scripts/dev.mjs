// wrangler dev を、鍵をファイルに書かずに起動する。
// OPENAI_API_KEY はユーザー環境変数から、OPENROUTER_API_KEY・ZAI_API_KEY は free-ai-pool の .env から読み、
// 子プロセスの環境変数だけに渡す(CLOUDFLARE_INCLUDE_PROCESS_ENV で wrangler が binding に載せる)。
// 使い方: node scripts/dev.mjs [--skip openai] [--port 8788] [-- <wrangler dev にそのまま渡す引数(例 --var IP_PER_10MIN:3)>]
import { execFileSync, spawn } from "node:child_process"
import { readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { tmpdir } from "node:os"

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

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, "..")
const all = process.argv.slice(2)
const sep = all.indexOf("--")
const args = sep >= 0 ? all.slice(0, sep) : all
const passthrough = sep >= 0 ? all.slice(sep + 1) : []
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : fallback
}

const env = { ...process.env, CLOUDFLARE_INCLUDE_PROCESS_ENV: "true" }
const poolEnv = process.env.FREE_AI_POOL_ENV ?? "C:/dev/ai-compute/free-ai-pool/.env"
if (existsSync(poolEnv)) {
  for (const line of readFileSync(poolEnv, "utf8").split(/\r?\n/)) {
    const m = line.match(/^(OPENROUTER_API_KEY|ZAI_API_KEY)=(.*)$/)
    if (m && !env[m[1]]) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "")
  }
}
if (!env.GEMINI_API_KEY) env.GEMINI_API_KEY = userEnv("GEMINI_PAID_API_KEY")
const skip = opt("--skip", "")
if (skip) env.TEST_SKIP_PROVIDERS = skip
for (const k of ["OPENAI_API_KEY", "OPENROUTER_API_KEY", "ZAI_API_KEY", "GEMINI_API_KEY"]) {
  console.log(`${k}: ${env[k] ? "set" : "missing"}`)
}

const port = opt("--port", "8788")
const child = spawn("npx", ["-y", "wrangler@4", "dev", "--config", join(root, "wrangler.jsonc"), "--port", port, "--ip", "127.0.0.1", "--persist-to", opt("--persist-to", join(tmpdir(), "avatar-brain-state")), "--var", "ALLOWED_ORIGINS:http://localhost:3000", ...passthrough], {
  cwd: root,
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
})
child.on("exit", (code) => process.exit(code ?? 0))
