import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // public/ は配信物をそのまま置く場所。同梱した静的サイトは webSites 側が
  // 正本で、こちらの規約で直すものではないので見ない。
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "public/**",
    "next-env.d.ts",
  ]),
])

export default eslintConfig
