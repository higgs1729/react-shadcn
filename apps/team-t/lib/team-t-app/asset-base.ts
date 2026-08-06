// Preview images are served from Cloudflare R2 instead of from public/. They
// are the heaviest thing this app owns and they grow with every new game or API
// page, so they live in a bucket rather than in git history, where nothing ever
// gets smaller. scripts/upload-assets.mjs puts them there and records what the
// bucket holds in scripts/asset-manifest.json.
//
// This is a constant and not an environment variable because it is public
// information: an env var would make every build environment — CI, a fresh
// clone, a contributor's machine — need setup before it could render an image
// that anyone on the internet can already fetch. Secrets stay in .env.local;
// this is the opposite of a secret.
//
// Only the two preview directories moved. public/games/api-cards/ is loaded by
// relative path from raw JS inside the game HTML and fed to a WebGL texture
// loader, which would need CORS to survive a cross-origin move.
export const ASSET_BASE_URL = "https://pub-eb8ed106e9974865a058ea8541c5ff30.r2.dev"
