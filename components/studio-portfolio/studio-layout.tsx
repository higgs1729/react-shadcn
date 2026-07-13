"use client"

import type { ComponentType, CSSProperties, ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpenIcon,
  BoxesIcon,
  CircleCheckBigIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
} from "lucide-react"

import { primaryNavigation, isPrimaryNavigationRoute } from "@/lib/studio-portfolio/app-spec"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
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

function AppHeader() {
  const pathname = usePathname()
  const activePage = primaryNavigation.find((item) => isPrimaryNavigationRoute(pathname, item.route))

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3 md:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{activePage?.label ?? "AI Design System Studio"}</p>
        <p className="truncate text-xs text-muted-foreground">Static portfolio</p>
      </div>
    </header>
  )
}

export function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
        } as CSSProperties
      }
    >
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/overview" className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 focus-visible:ring-2 focus-visible:outline-hidden">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BoxesIcon className="size-4" />
            </span>
            <span className="min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="block truncate text-sm font-semibold">AI Design System</span>
              <span className="block truncate text-xs text-sidebar-foreground/70">Studio Portfolio</span>
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Portfolio</SidebarGroupLabel>
            <SidebarGroupContent>
              <PrimaryNavigation />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <p className="px-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            Evidence-led UI system
          </p>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
