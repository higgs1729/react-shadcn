const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** Prefix a local route or public asset with GAMEHUB's deployment basePath. */
export function withBasePath(pathname: string): string {
  if (!pathname.startsWith("/")) {
    return pathname
  }

  const hasFileExtension = /\.[^/]+$/.test(pathname)
  const routePath =
    pathname === "/" || pathname.endsWith("/") || hasFileExtension
      ? pathname
      : `${pathname}/`

  return `${basePath}${routePath}`
}
