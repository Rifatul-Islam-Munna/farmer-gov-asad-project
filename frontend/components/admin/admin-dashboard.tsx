"use client"

import * as React from "react"
import {
  Activity,
  Megaphone,
  Boxes,
  Handshake,
  Images,
  KeyRound,
  LayoutDashboard,
  LogOut,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingBasket,
  UserCheck,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  API_URL,
  apiRequest,
  getCsrfToken,
  type AdminUser,
  type ApiEnvelope,
  type DashboardData,
  type Deal,
  type Good,
  type GoodsPayload,
  type InventoryItem,
  type Listing,
  type MarketPrice,
} from "@/lib/admin-api"
import { ImageProfilesPanel, ProfessionalReviewsPanel } from "./admin-governance-panels"
import { AdminMarketControls } from "./admin-market-controls"
import { AdminOverview } from "./admin-overview"
import {
  DealsPanel,
  InventoryPanel,
  ListingsPanel,
  UsersPanel,
} from "./admin-resource-panels"
import { AdminSystemPanel } from "./admin-system-panel"
import { IntegrationSettingsPanel } from "./integration-settings-panel"
import { MarketplaceManagementPanel } from "./marketplace-management-panel"
import { CommunicationsManagementPanel } from "./communications-management-panel"

type View =
  | "overview"
  | "users"
  | "reviews"
  | "listings"
  | "deals"
  | "prices"
  | "inventory"
  | "marketplaceOps"
  | "integrations"
  | "imageProfiles"
  | "communications"
  | "system"

type SessionUser = {
  id: string
  name: string
  role: string
  roles?: string[]
}

const views: Array<[
  View,
  string,
  React.ComponentType<{ className?: string }>,
]> = [
  ["overview", "Overview", LayoutDashboard],
  ["users", "Users", Users],
  ["reviews", "Professional reviews", UserCheck],
  ["listings", "Listings", ShoppingBasket],
  ["deals", "Deals", Handshake],
  ["prices", "Prices & goods", Search],
  ["inventory", "Inventory", Boxes],
  ["marketplaceOps", "Marketplace operations", ShoppingBasket],
  ["integrations", "AI & providers", KeyRound],
  ["imageProfiles", "Image profiles", Images],
  ["communications", "Notices, ads & support", Megaphone],
  ["system", "System & audit", Activity],
]

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = React.useState<boolean | null>(null)
  const [sessionUser, setSessionUser] = React.useState<SessionUser | null>(null)
  const [view, setView] = React.useState<View>("overview")
  const [dashboard, setDashboard] = React.useState<DashboardData | null>(null)
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [listings, setListings] = React.useState<Listing[]>([])
  const [deals, setDeals] = React.useState<Deal[]>([])
  const [prices, setPrices] = React.useState<MarketPrice[]>([])
  const [goods, setGoods] = React.useState<Good[]>([])
  const [inventory, setInventory] = React.useState<InventoryItem[]>([])
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  const checkSession = React.useCallback(async () => {
    const response = await fetch("/api/session/me", {
      credentials: "include",
      cache: "no-store",
    })
    const body = await response.json().catch(() => ({}))
    setAuthenticated(response.ok)
    setSessionUser(response.ok ? (body.user as SessionUser) : null)
    return response.ok
  }, [])

  const load = React.useCallback(async () => {
    if (!authenticated) return
    setLoading(true)
    setMessage(null)
    try {
      const [a, b, c, d, e, f, g] = await Promise.all([
        apiRequest<ApiEnvelope<DashboardData>>("/admin/dashboard"),
        apiRequest<ApiEnvelope<AdminUser[]>>("/admin/users?limit=500"),
        apiRequest<ApiEnvelope<Listing[]>>("/admin/listings?limit=500"),
        apiRequest<ApiEnvelope<Deal[]>>("/admin/deals?limit=500"),
        apiRequest<ApiEnvelope<MarketPrice[]>>("/admin/prices"),
        apiRequest<ApiEnvelope<GoodsPayload>>("/admin/goods"),
        apiRequest<ApiEnvelope<InventoryItem[]>>("/admin/inventory?limit=500"),
      ])
      setDashboard(a.data)
      setUsers(b.data)
      setListings(c.data)
      setDeals(d.data)
      setPrices(e.data)
      setGoods(f.data.goods)
      setInventory(g.data)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load data")
      if (error instanceof Error && /authentication|unauthorized|401/i.test(error.message)) {
        setAuthenticated(false)
      }
    } finally {
      setLoading(false)
    }
  }, [authenticated])

  React.useEffect(() => {
    const timer = window.setTimeout(() => void checkSession(), 0)
    return () => window.clearTimeout(timer)
  }, [checkSession])

  React.useEffect(() => {
    if (!authenticated) return
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [authenticated, load])

  async function change(path: string, body: unknown, method = "PATCH") {
    try {
      await apiRequest(path, { method, body: JSON.stringify(body) })
      setMessage("Saved successfully")
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save")
    }
  }

  async function logout() {
    const response = await fetch("/api/session/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "x-csrf-token": getCsrfToken() ?? "",
      },
    })
    if (!response.ok) {
      setMessage("Could not sign out safely")
      return
    }
    window.location.assign("/dashboard/admin/login")
  }

  async function switchRole(role: string) {
    if (!sessionUser || role === sessionUser.role) return
    try {
      await apiRequest("/user/active-role", {
        method: "PATCH",
        body: JSON.stringify({ role }),
      })
      window.location.assign("/dashboard/admin/login")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not switch role")
    }
  }

  if (authenticated === null) {
    return (
      <main className="app-shell grid min-h-screen place-items-center">
        <RefreshCcw className="size-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!authenticated) {
    if (typeof window !== "undefined") {
      window.location.replace("/dashboard/admin/login")
    }
    return (
      <main className="app-shell grid min-h-screen place-items-center">
        <RefreshCcw className="size-8 animate-spin text-primary" />
      </main>
    )
  }

  const q = search.toLowerCase().trim()
  const match = (...values: unknown[]) =>
    values.some((value) => String(value ?? "").toLowerCase().includes(q))
  const filteredUsers = users.filter((item) =>
    match(
      item.name,
      item.phoneNumber,
      item.email,
      item.role,
      item.verificationStatus,
      item.accountStatus,
    ),
  )
  const filteredListings = listings.filter((item) =>
    match(item.goodName, item.goodCode, item.ownerId, item.status, item.address),
  )
  const filteredDeals = deals.filter((item) =>
    match(item._id, item.buyerId, item.farmerId, item.status),
  )
  const filteredInventory = inventory.filter((item) =>
    match(item.shopName, item.medicineName, item.address, item.active),
  )

  return (
    <div className="app-shell min-h-screen lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="glass-panel border-b p-5 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r">
        <div className="mb-8 flex items-center gap-3">
          <div className="glass-brand-mark grid size-10 place-items-center rounded-xl text-primary-foreground">
            <ShieldCheck />
          </div>
          <div>
            <div className="font-semibold">Farmer Government</div>
            <div className="text-xs text-muted-foreground">Admin control center</div>
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {views.map(([key, label, Icon]) => (
            <Button
              key={key}
              variant={view === key ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setView(key)}
            >
              <Icon />
              {label}
            </Button>
          ))}
        </nav>
        <Card className="mt-8 hidden lg:block" size="sm">
          <CardHeader>
            <CardTitle>Secure API proxy</CardTitle>
            <CardDescription className="break-all">{API_URL}</CardDescription>
          </CardHeader>
        </Card>
      </aside>

      <main className="min-w-0">
        <header className="glass-panel sticky top-0 z-20 flex items-center justify-between border-b px-4 py-3 md:px-8">
          <div>
            <h1 className="text-xl font-semibold">
              {views.find((item) => item[0] === view)?.[1]}
            </h1>
            <p className="text-xs text-muted-foreground">
              HTTP-only session, CSRF protection and audited operations
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {(sessionUser?.roles?.length ?? 0) > 1 ? (
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={sessionUser?.role ?? "admin"}
                onChange={(event) => void switchRole(event.target.value)}
                aria-label="Switch active role"
              >
                {sessionUser?.roles?.map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/([A-Z])/g, " $1")}
                  </option>
                ))}
              </select>
            ) : null}
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCcw className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button variant="ghost" onClick={() => void logout()}>
              <LogOut />
              Sign out
            </Button>
          </div>
        </header>

        <div className="space-y-4 p-4 md:p-8">
          {message ? (
            <Card>
              <CardContent className="py-3">{message}</CardContent>
            </Card>
          ) : null}
          {!['overview', 'reviews', 'integrations', 'imageProfiles', 'communications', 'system'].includes(view) ? (
            <div className="relative max-w-md">
              <Search className="absolute left-2 top-2 size-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search current section"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          ) : null}

          {view === "overview" ? <AdminOverview data={dashboard} /> : null}
          {view === "users" ? <UsersPanel items={filteredUsers} change={change} /> : null}
          {view === "reviews" ? <ProfessionalReviewsPanel /> : null}
          {view === "listings" ? <ListingsPanel items={filteredListings} change={change} /> : null}
          {view === "deals" ? <DealsPanel items={filteredDeals} change={change} /> : null}
          {view === "prices" ? <AdminMarketControls prices={prices} goods={goods} save={change} /> : null}
          {view === "inventory" ? <InventoryPanel items={filteredInventory} change={change} /> : null}
          {view === "marketplaceOps" ? <MarketplaceManagementPanel /> : null}
          {view === "integrations" ? <IntegrationSettingsPanel token="cookie-session" /> : null}
          {view === "imageProfiles" ? <ImageProfilesPanel /> : null}
          {view === "communications" ? <CommunicationsManagementPanel /> : null}
          {view === "system" ? <AdminSystemPanel token="cookie-session" /> : null}
        </div>
      </main>
    </div>
  )
}



