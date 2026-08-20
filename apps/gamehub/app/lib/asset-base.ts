/** Public Cloudflare R2 origin used for GameHub preview images. */
export const ASSET_BASE_URL =
  "https://pub-eb8ed106e9974865a058ea8541c5ff30.r2.dev"

export function gamePreviewUrl(fileName: string): string {
  return `${ASSET_BASE_URL}/gamehub-previews/${fileName}`
}
