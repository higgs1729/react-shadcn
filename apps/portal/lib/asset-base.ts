// App preview screenshots are served from Cloudflare R2 instead of from
// public/. scripts/upload-assets.mjs puts them there and records what the
// bucket holds in scripts/asset-manifest.json.
//
// This is a constant and not an environment variable because it is public
// information: an env var would make every build environment — CI, a fresh
// clone, a contributor's machine — need setup before it could render an image
// that anyone on the internet can already fetch. Secrets stay in .env.local;
// this is the opposite of a secret.
//
// Same bucket and public URL as apps/team-t/lib/team-t-app/asset-base.ts —
// the R2 key prefix (app-previews/ vs game-previews/, api-page-previews/) is
// what keeps the two apps' objects apart.
export const ASSET_BASE_URL =
  "https://pub-eb8ed106e9974865a058ea8541c5ff30.r2.dev"
