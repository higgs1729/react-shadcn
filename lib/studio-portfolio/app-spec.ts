import rawSpec from "@/studioAppSpec/studio-app-spec.json"

type PrimaryNavigationItem = {
  id: string
  label: string
  route: string
}

type StudioAppSpec = {
  appId: string
  rootRoute: string
  indexRoute: string
  orientationCompletedRoute: string
  layout: {
    primaryNavigation: PrimaryNavigationItem[]
  }
}

export const studioAppSpec = rawSpec as StudioAppSpec
export const primaryNavigation = studioAppSpec.layout.primaryNavigation

export function isPrimaryNavigationRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`)
}
