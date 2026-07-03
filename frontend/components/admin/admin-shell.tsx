"use client"

import type * as React from "react"
import {
  BarChart3,
  Boxes,
  Handshake,
  Leaf,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCcw,
  ShoppingBasket,
  Tags,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export type AdminView =
  | "overview"
  | "users"
  | "listings"
  | "deals"
  | "catalog"
  | "inventory"
  | "reports"

export const adminNavigation: Array<{
  value: AdminView
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { value: "overview", label: "Overview", description: "Platform performance", icon: LayoutDashboard },
  { value: "users", label: "Users", description: "Accounts and verification", icon: Users },
  { value: "listings", label: "Listings", description: "Marketplace supply", icon: ShoppingBasket },
  { value: "deals", label: "Deals & offers", description: "Negotiation and sales", icon: Handshake },
  { value: "catalog", label: "Prices & goods", description: "Reference prices and catalog", icon: Tags },
  { value: "inventory", label: "Seller inventory", description: "Medicine and shop stock", icon: Boxes },
  { value: "reports", label: "Reports", description: "Charts and data exports", icon: BarChart3 },
]

export function AdminShell({
  view,
  onViewChange,
  loading,
  onRefresh,
  onLogout,
  counts,
  notice,
  children,
}: {
  view: AdminView
  onViewChange: (view: AdminView) => void
  loading: boolean
  onRefresh: () => void
  onLogout: () => void
  counts: Partial<Record<AdminView, number>>
  notice?: { tone: "success" | "error"; message: string } | null
  children: React.ReactNode
}) {
  const current = adminNavigation.find((item) => item.value === view)!

  return (
    <div className="min-h-screen bg-muted/35 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r bg-background lg:flex">
        <Brand />
        <Separator />
        <Navigation view={view} counts={counts} onViewChange={onViewChange} />
        <div className="mt-auto p-4">
          <Card className="border-primary/15 bg-primary/5" size="sm">
            <CardContent className="space-y-3 py-3">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">Administrator</p>
                  <p className="truncate text-xs text-muted-foreground">Management account</p>
                </div>
              </div>
              <Button className="w-full justify-start" variant="ghost" onClick={onLogout}>
                <LogOut />
                Sign out
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 md:px-7">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" className="lg:hidden" />}>
                <Menu />
                <span className="sr-only">Open navigation</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[310px] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Admin navigation</SheetTitle>
                  <SheetDescription>Navigate between administration sections.</SheetDescription>
                </SheetHeader>
                <Brand />
                <Separator />
                <Navigation view={view} counts={counts} onViewChange={onViewChange} />
                <div className="border-t p-4">
                  <Button className="w-full justify-start" variant="outline" onClick={onLogout}>
                    <LogOut />
                    Sign out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-semibold tracking-tight">{current.label}</h1>
                <Badge variant="outline" className="hidden sm:inline-flex">Live administration</Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">{current.description}</p>
            </div>

            <Button variant="outline" size="icon" className="hidden sm:inline-flex" onClick={onRefresh} disabled={loading}>
              <RefreshCcw className={cn(loading && "animate-spin")} />
              <span className="sr-only">Refresh data</span>
            </Button>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1680px] p-4 md:p-7">
          {notice ? (
            <div
              className={cn(
                "mb-5 rounded-xl border p-3 text-sm",
                notice.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  : "border-destructive/25 bg-destructive/10 text-destructive",
              )}
            >
              {notice.message}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  )
}

function Brand() {
  return (
    <div className="flex h-20 items-center gap-3 px-5">
      <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <Leaf className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold tracking-tight">Farmer Government</p>
        <p className="truncate text-xs text-muted-foreground">Administration portal</p>
      </div>
    </div>
  )
}

function Navigation({
  view,
  counts,
  onViewChange,
}: {
  view: AdminView
  counts: Partial<Record<AdminView, number>>
  onViewChange: (view: AdminView) => void
}) {
  return (
    <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
      <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
      {adminNavigation.map((item) => {
        const Icon = item.icon
        const active = item.value === view
        const count = counts[item.value]
        return (
          <Button
            key={item.value}
            variant={active ? "secondary" : "ghost"}
            className={cn(
              "h-auto w-full justify-start gap-3 px-3 py-2.5 text-left",
              active && "bg-primary/10 text-primary hover:bg-primary/15",
            )}
            onClick={() => onViewChange(item.value)}
          >
            <div className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground",
              active && "bg-primary text-primary-foreground",
            )}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.label}</p>
              <p className="truncate text-[11px] font-normal text-muted-foreground">{item.description}</p>
            </div>
            {typeof count === "number" ? (
              <Badge variant={active ? "default" : "secondary"}>{count}</Badge>
            ) : null}
          </Button>
        )
      })}
    </nav>
  )
}
