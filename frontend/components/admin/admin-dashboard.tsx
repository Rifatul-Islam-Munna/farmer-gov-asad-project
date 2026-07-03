"use client"

import * as React from "react"
import { AdminLogin } from "./admin-login"
import { AdminShell, type AdminView } from "./admin-shell"
import { CatalogPage } from "./catalog-page"
import { DealsPage } from "./deals-page"
import { InventoryPage } from "./inventory-page"
import { ListingsPage } from "./listings-page"
import { OverviewPage } from "./overview-page"
import { PageSkeleton } from "./page-elements"
import { ReportsPage } from "./reports-page"
import { UsersPage } from "./users-page"
import {
  apiRequest,
  type AdminDataSnapshot,
  type AdminUser,
  type ApiEnvelope,
  type DashboardData,
  type Deal,
  type GoodsPayload,
  type InventoryItem,
  type Listing,
  type MarketPrice,
  type Offer,
} from "@/lib/admin-api"

const emptyData: AdminDataSnapshot = {
  dashboard: null,
  users: [],
  listings: [],
  offers: [],
  deals: [],
  prices: [],
  goods: [],
  categories: [],
  inventory: [],
}

export function AdminDashboard() {
  const [hydrated, setHydrated] = React.useState(false)
  const [token, setToken] = React.useState<string | null>(null)
  const [view, setView] = React.useState<AdminView>("overview")
  const [data, setData] = React.useState<AdminDataSnapshot>(emptyData)
  const [loading, setLoading] = React.useState(false)
  const [notice, setNotice] = React.useState<{
    tone: "success" | "error"
    message: string
  } | null>(null)

  React.useEffect(() => {
    setToken(localStorage.getItem("farmer-admin-token"))
    setHydrated(true)
  }, [])

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [dashboard, users, listings, offers, deals, prices, goods, inventory] =
        await Promise.all([
          apiRequest<ApiEnvelope<DashboardData>>("/admin/dashboard", {}, token),
          apiRequest<ApiEnvelope<AdminUser[]>>(
            "/admin/users?limit=500",
            {},
            token,
          ),
          apiRequest<ApiEnvelope<Listing[]>>(
            "/admin/listings?limit=500",
            {},
            token,
          ),
          apiRequest<ApiEnvelope<Offer[]>>(
            "/admin/offers?limit=500",
            {},
            token,
          ),
          apiRequest<ApiEnvelope<Deal[]>>(
            "/admin/deals?limit=500",
            {},
            token,
          ),
          apiRequest<ApiEnvelope<MarketPrice[]>>("/admin/prices", {}, token),
          apiRequest<ApiEnvelope<GoodsPayload>>("/admin/goods", {}, token),
          apiRequest<ApiEnvelope<InventoryItem[]>>(
            "/admin/inventory?limit=500",
            {},
            token,
          ),
        ])

      setData({
        dashboard: dashboard.data,
        users: users.data,
        listings: listings.data,
        offers: offers.data,
        deals: deals.data,
        prices: prices.data,
        goods: goods.data.goods,
        categories: goods.data.categories,
        inventory: inventory.data,
      })
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not load administration data.",
      })
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    if (token) void load()
  }, [load, token])

  React.useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  async function change(path: string, body: unknown, method = "PATCH") {
    if (!token) return false
    try {
      await apiRequest(path, { method, body: JSON.stringify(body) }, token)
      setNotice({ tone: "success", message: "Changes saved successfully." })
      await load()
      return true
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Could not save changes.",
      })
      return false
    }
  }

  function login(nextToken: string) {
    localStorage.setItem("farmer-admin-token", nextToken)
    setToken(nextToken)
  }

  function logout() {
    localStorage.removeItem("farmer-admin-token")
    setToken(null)
    setData(emptyData)
    setNotice(null)
  }

  if (!hydrated) {
    return <div className="min-h-screen bg-muted/30" />
  }

  if (!token) {
    return <AdminLogin onLogin={login} />
  }

  const counts: Partial<Record<AdminView, number>> = {
    users: data.users.filter((user) => user.verificationStatus === "pending").length,
    listings: data.listings.length,
    deals: data.deals.length,
    catalog: data.goods.length,
    inventory: data.inventory.filter((item) => item.active).length,
  }

  return (
    <AdminShell
      view={view}
      onViewChange={setView}
      loading={loading}
      onRefresh={() => void load()}
      onLogout={logout}
      counts={counts}
      notice={notice}
    >
      {loading && data.dashboard === null ? (
        <PageSkeleton />
      ) : (
        <>
          {view === "overview" ? (
            <OverviewPage data={data.dashboard} onNavigate={setView} />
          ) : null}
          {view === "users" ? (
            <UsersPage users={data.users} change={change} />
          ) : null}
          {view === "listings" ? (
            <ListingsPage listings={data.listings} change={change} />
          ) : null}
          {view === "deals" ? (
            <DealsPage deals={data.deals} offers={data.offers} change={change} />
          ) : null}
          {view === "catalog" ? (
            <CatalogPage
              prices={data.prices}
              goods={data.goods}
              categories={data.categories}
              change={change}
            />
          ) : null}
          {view === "inventory" ? (
            <InventoryPage inventory={data.inventory} change={change} />
          ) : null}
          {view === "reports" ? <ReportsPage data={data} /> : null}
        </>
      )}
    </AdminShell>
  )
}
