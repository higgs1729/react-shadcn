"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpenIcon,
  BoxesIcon,
  CircleCheckBigIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  XIcon,
} from "lucide-react"

import {
  primaryNavigation,
  isPrimaryNavigationRoute,
} from "@/lib/studio-portfolio/app-spec"
import { ResizableSidebarRail } from "@/components/resizable-sidebar-rail"
import { SettingsDialog } from "@/components/studio-portfolio/settings-page"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationIcons: Record<string, ComponentType<{ className?: string }>> = {
  overview: LayoutDashboardIcon,
  patterns: BoxesIcon,
  studio: FolderKanbanIcon,
  quality: CircleCheckBigIcon,
  "case-study": BookOpenIcon,
}

function PrimaryNavigation() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarMenu>
      {primaryNavigation.map((item) => {
        const Icon = navigationIcons[item.id] ?? LayoutDashboardIcon
        const isActive = isPrimaryNavigationRoute(pathname, item.route)

        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.label}
              render={<Link href={item.route} />}
              className="relative data-active:bg-primary/10 data-active:shadow-none data-active:before:absolute data-active:before:inset-y-1 data-active:before:left-0 data-active:before:w-0.5 data-active:before:rounded-full data-active:before:bg-primary data-active:hover:bg-primary/15"
              onClick={() => {
                if (isMobile) setOpenMobile(false)
              }}
            >
              <Icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

type AppWindow = { id: string; route: string }

function getWindowLabel(route: string) {
  if (route.startsWith("/settings")) return "Settings"
  return (
    primaryNavigation.find((item) =>
      isPrimaryNavigationRoute(route, item.route)
    )?.label ?? "Studio"
  )
}

function getChildRouteLabel(pathname: string) {
  if (pathname === "/quality/coverage") return "Coverage matrix"
  if (pathname === "/studio/result") return "Result report"
  if (pathname === "/studio/preview") return "Implementation preview"
  return null
}

function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [windows, setWindows] = useState<AppWindow[]>(() => [
    { id: "window-1", route: pathname },
  ])
  const [activeWindowId, setActiveWindowId] = useState("window-1")
  const activeWindowIdRef = useRef(activeWindowId)
  const pendingWindowRoute = useRef<string | null>(null)
  const childRouteLabel = getChildRouteLabel(pathname)

  useEffect(() => {
    activeWindowIdRef.current = activeWindowId
  }, [activeWindowId])

  useEffect(() => {
    if (pendingWindowRoute.current === pathname) {
      pendingWindowRoute.current = null
      return
    }

    setWindows((currentWindows) =>
      currentWindows.map((window) =>
        window.id === activeWindowIdRef.current
          ? { ...window, route: pathname }
          : window
      )
    )
  }, [pathname])

  const openWindow = useCallback((route: string) => {
    const id = `window-${Date.now()}`
    pendingWindowRoute.current = route
    activeWindowIdRef.current = id
    setWindows((currentWindows) => [...currentWindows, { id, route }])
    setActiveWindowId(id)
  }, [])

  useEffect(() => {
    const handleWindowLink = (event: globalThis.MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const anchor =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[data-open-window]")
          : null
      const route = anchor?.getAttribute("href")
      if (route) openWindow(route)
    }

    window.addEventListener("click", handleWindowLink, true)
    return () => window.removeEventListener("click", handleWindowLink, true)
  }, [openWindow])

  const closeWindow = (id: string) => {
    if (windows.length === 1) return
    const windowIndex = windows.findIndex((window) => window.id === id)
    const nextWindow = windows[windowIndex === 0 ? 1 : windowIndex - 1]
    setWindows((currentWindows) =>
      currentWindows.filter((window) => window.id !== id)
    )
    if (id === activeWindowId) {
      activeWindowIdRef.current = nextWindow.id
      setActiveWindowId(nextWindow.id)
      router.push(nextWindow.route)
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-end gap-2 overflow-x-auto border-b bg-muted/30 px-2 pt-1">
      <SidebarTrigger className="mb-1.5 shrink-0" />
      <Separator orientation="vertical" className="mb-1.5 h-5 shrink-0" />
      <div
        role="tablist"
        aria-label="Open pages"
        className="flex min-w-max items-end gap-1"
      >
        {windows.map((window) => {
          const isActive = window.id === activeWindowId
          return (
            <div
              key={window.id}
              data-active={isActive}
              className="flex h-10 min-w-36 items-center gap-1 rounded-t-md border border-b-0 bg-background px-2 text-sm shadow-sm data-[active=false]:border-transparent data-[active=false]:bg-transparent data-[active=false]:text-muted-foreground data-[active=false]:shadow-none"
            >
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                className="min-w-0 flex-1 truncate text-left font-medium outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  activeWindowIdRef.current = window.id
                  setActiveWindowId(window.id)
                  router.push(window.route)
                }}
              >
                {getWindowLabel(window.route)}
              </button>
              {windows.length > 1 ? (
                <button
                  type="button"
                  aria-label={`Close ${getWindowLabel(window.route)}`}
                  className="grid size-5 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => closeWindow(window.id)}
                >
                  <XIcon className="size-3.5" />
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
      {childRouteLabel ? (
        <p className="mb-2 ml-2 hidden min-w-max text-xs text-muted-foreground md:block">
          {getWindowLabel(pathname)} <span aria-hidden="true">›</span>{" "}
          {childRouteLabel}
        </p>
      ) : null}
    </header>
  )
}

export function StudioLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
        } as CSSProperties
      }
    >
      <Sidebar collapsible="icon">
        <SidebarContent className="pt-3">
          <SidebarGroup>
            <SidebarGroupContent>
              <PrimaryNavigation />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={settingsOpen || pathname === "/settings"}
                tooltip="Settings"
                className="relative data-active:bg-primary/10 data-active:shadow-none data-active:before:absolute data-active:before:inset-y-1 data-active:before:left-0 data-active:before:w-0.5 data-active:before:rounded-full data-active:before:bg-primary data-active:hover:bg-primary/15"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings2Icon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <p className="px-2 pt-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            Evidence-led UI system
          </p>
        </SidebarFooter>
        <ResizableSidebarRail />
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </SidebarProvider>
  )
}
