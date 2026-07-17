"use client"

import * as React from "react"
import { Boxes, Handshake, KeyRound, LayoutDashboard, LogOut, RefreshCcw, Search, ShieldCheck, ShoppingBasket, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_URL, apiRequest, type AdminUser, type ApiEnvelope, type DashboardData, type Deal, type Good, type GoodsPayload, type InventoryItem, type Listing, type MarketPrice } from "@/lib/admin-api"
import { AdminOverview } from "./admin-overview"
import { AdminMarketControls } from "./admin-market-controls"
import { DealsPanel, InventoryPanel, ListingsPanel, UsersPanel } from "./admin-resource-panels"
import { IntegrationSettingsPanel } from "./integration-settings-panel"

type View = "overview" | "users" | "listings" | "deals" | "prices" | "inventory" | "integrations"
const views: Array<[View, string, React.ComponentType<{ className?: string }>]> = [
  ["overview", "Overview", LayoutDashboard], ["users", "Users", Users],
  ["listings", "Listings", ShoppingBasket], ["deals", "Deals", Handshake],
  ["prices", "Prices & goods", Search], ["inventory", "Inventory", Boxes],
  ["integrations", "AI & providers", KeyRound],
]

export function AdminDashboard() {
  const [token, setToken] = React.useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("farmer-admin-token"),
  )
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

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true); setMessage(null)
    try {
      const [a,b,c,d,e,f,g] = await Promise.all([
        apiRequest<ApiEnvelope<DashboardData>>("/admin/dashboard", {}, token),
        apiRequest<ApiEnvelope<AdminUser[]>>("/admin/users?limit=500", {}, token),
        apiRequest<ApiEnvelope<Listing[]>>("/admin/listings?limit=500", {}, token),
        apiRequest<ApiEnvelope<Deal[]>>("/admin/deals?limit=500", {}, token),
        apiRequest<ApiEnvelope<MarketPrice[]>>("/admin/prices", {}, token),
        apiRequest<ApiEnvelope<GoodsPayload>>("/admin/goods", {}, token),
        apiRequest<ApiEnvelope<InventoryItem[]>>("/admin/inventory?limit=500", {}, token),
      ])
      setDashboard(a.data); setUsers(b.data); setListings(c.data); setDeals(d.data)
      setPrices(e.data); setGoods(f.data.goods); setInventory(g.data)
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load data") }
    finally { setLoading(false) }
  }, [token])
  React.useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  async function change(path: string, body: unknown, method = "PATCH") {
    if (!token) return
    try { await apiRequest(path, { method, body: JSON.stringify(body) }, token); setMessage("Saved successfully"); await load() }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save") }
  }
  function logout() { localStorage.removeItem("farmer-admin-token"); setToken(null) }
  if (!token) return <Login onLogin={(value) => { localStorage.setItem("farmer-admin-token", value); setToken(value) }} />

  const q = search.toLowerCase().trim()
  const match = (...values: unknown[]) => values.some((value) => String(value ?? "").toLowerCase().includes(q))
  const filteredUsers = users.filter((x) => match(x.name,x.phoneNumber,x.email,x.role,x.verificationStatus))
  const filteredListings = listings.filter((x) => match(x.goodName,x.goodCode,x.ownerId,x.status,x.address))
  const filteredDeals = deals.filter((x) => match(x._id,x.buyerId,x.farmerId,x.status))
  const filteredInventory = inventory.filter((x) => match(x.shopName,x.medicineName,x.address,x.active))

  return <div className="app-shell min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
    <aside className="glass-panel border-b p-5 lg:sticky lg:top-0 lg:h-screen lg:border-r">
      <div className="mb-8 flex items-center gap-3"><div className="glass-brand-mark grid size-10 place-items-center rounded-xl text-primary-foreground"><ShieldCheck /></div><div><div className="font-semibold">Farmer Government</div><div className="text-xs text-muted-foreground">Admin control center</div></div></div>
      <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">{views.map(([key,label,Icon]) => <Button key={key} variant={view===key?"default":"ghost"} className="justify-start" onClick={()=>setView(key)}><Icon />{label}</Button>)}</nav>
      <Card className="mt-8 hidden lg:block" size="sm"><CardHeader><CardTitle>API</CardTitle><CardDescription className="break-all">{API_URL}</CardDescription></CardHeader></Card>
    </aside>
    <main className="min-w-0">
      <header className="glass-panel sticky top-0 z-20 flex items-center justify-between border-b px-4 py-3 md:px-8"><div><h1 className="text-xl font-semibold capitalize">{views.find(x=>x[0]===view)?.[1]}</h1><p className="text-xs text-muted-foreground">Operations, controls and reports</p></div><div className="flex gap-2"><Button variant="outline" onClick={()=>void load()} disabled={loading}><RefreshCcw className={loading?"animate-spin":""}/>Refresh</Button><Button variant="ghost" onClick={logout}><LogOut/>Sign out</Button></div></header>
      <div className="space-y-4 p-4 md:p-8">{message && <Card><CardContent className="py-3">{message}</CardContent></Card>}
        {view!=="overview" && <div className="relative max-w-md"><Search className="absolute left-2 top-2 size-4 text-muted-foreground"/><Input className="pl-8" placeholder="Search current section" value={search} onChange={e=>setSearch(e.target.value)}/></div>}
        {view==="overview" && <AdminOverview data={dashboard}/>} 
        {view==="users" && <UsersPanel items={filteredUsers} change={change}/>} 
        {view==="listings" && <ListingsPanel items={filteredListings} change={change}/>} 
        {view==="deals" && <DealsPanel items={filteredDeals} change={change}/>} 
        {view==="prices" && <AdminMarketControls prices={prices} goods={goods} save={change}/>} 
        {view==="inventory" && <InventoryPanel items={filteredInventory} change={change}/>} 
        {view==="integrations" && <IntegrationSettingsPanel token={token}/>} 
      </div>
    </main>
  </div>
}

function Login({onLogin}:{onLogin:(token:string)=>void}) { const [login,setLogin]=React.useState(""); const [password,setPassword]=React.useState(""); const [error,setError]=React.useState(""); async function submit(e:React.FormEvent){e.preventDefault();try{const r=await apiRequest<{access_token:string}>("/user/login-user",{method:"POST",body:JSON.stringify({phoneNumber:login,password})});onLogin(r.access_token)}catch(x){setError(x instanceof Error?x.message:"Login failed")}} return <main className="app-shell grid min-h-screen place-items-center p-4"><Card className="w-full max-w-md"><CardHeader><CardTitle>Administrator sign in</CardTitle><CardDescription>Use the configured admin email or phone and password.</CardDescription></CardHeader><CardContent><form className="space-y-4" onSubmit={submit}><div><Label className="mb-2">Email or phone</Label><Input value={login} onChange={e=>setLogin(e.target.value)} required/></div><div><Label className="mb-2">Password</Label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>{error&&<p className="text-sm text-destructive">{error}</p>}<Button className="w-full" type="submit"><ShieldCheck/>Sign in</Button></form></CardContent></Card></main> }
