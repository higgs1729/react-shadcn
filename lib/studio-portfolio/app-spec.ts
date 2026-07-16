import rawSpec from "@/docs/apps/studio/studio-app-spec.json"

type PrimaryNavigationItem = {
  id: string
  label: string
  route: string
}

type ExampleApp = PrimaryNavigationItem & {
  implementationStatus: "planned" | "built"
  previewRoute?: string
  screenType: string
  selectedPattern: string
}

type StudioAppSpec = {
  appId: string
  rootRoute: string
  indexRoute: string
  orientationCompletedRoute: string
  layout: {
    primaryNavigation: PrimaryNavigationItem[]
    exampleNavigation: PrimaryNavigationItem[]
  }
  exampleApps: {
    items: ExampleApp[]
  }
}

export const studioAppSpec = rawSpec as StudioAppSpec
export const primaryNavigation = studioAppSpec.layout.primaryNavigation
export const exampleNavigation = studioAppSpec.layout.exampleNavigation.filter((item) =>
  studioAppSpec.exampleApps.items.some(
    (app) => app.id === item.id && app.implementationStatus === "built"
  )
)
export const builtExampleApps = studioAppSpec.exampleApps.items.filter(
  (app) => app.implementationStatus === "built"
)

export function isPrimaryNavigationRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`)
}
