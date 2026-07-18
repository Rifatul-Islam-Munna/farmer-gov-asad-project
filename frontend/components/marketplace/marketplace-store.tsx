"use client"

import * as React from "react"
import { FileText, Heart, Mic, PackageCheck, Search, ShoppingCart, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiRequest, type ApiEnvelope } from "@/lib/admin-api"

type Product = {
  id: string
  sellerId: string
  categoryCode: string
  title: string
  description: string
  imageUrls: string[]
  price: number
  currency: string
  stock: number
  transactionType: "sale" | "rental" | "auction"
  rentalDailyRate?: number
  machineryBrand?: string
  machineryModel?: string
  status: string
}
type SearchResult = { items: Product[]; total: number; page: number; limit: number }
type CartItem = { id: string; productId: string; quantity: number }
type Order = { id: string; orderNumber: string; total: number; currency: string; status: string; paymentStatus: string; trackingNumber?: string }
type ReviewSummary = { average: number; count: number; distribution: Record<number, number> }
type Favorite = { id: string; productId: string; product: Product }
type SavedSearch = { id: string; name: string; query: string; filters?: Record<string, unknown> }

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => {
      lang: string
      interimResults: boolean
      start: () => void
      onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void
      onerror: () => void
    }
  }
}

export function MarketplaceStore() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [transactionType, setTransactionType] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [message, setMessage] = React.useState("")
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = React.useState(false)
  const [orders, setOrders] = React.useState<Order[]>([])
  const [ordersOpen, setOrdersOpen] = React.useState(false)
  const [reviewSummary, setReviewSummary] = React.useState<{ product: Product; aggregate: ReviewSummary } | null>(null)
  const [favorites, setFavorites] = React.useState<Favorite[]>([])
  const [savedSearches, setSavedSearches] = React.useState<SavedSearch[]>([])
  const [libraryOpen, setLibraryOpen] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    setMessage("")
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set("q", query.trim())
      if (category) params.set("categoryCode", category)
      if (transactionType) params.set("transactionType", transactionType)
      params.set("limit", "50")
      const result = await apiRequest<ApiEnvelope<SearchResult> & SearchResult>(`/marketplace/products?${params}`)
      setProducts((result.data ?? result).items)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load marketplace")
    } finally {
      setLoading(false)
    }
  }, [category, query, transactionType])

  React.useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  async function protectedAction(action: () => Promise<unknown>) {
    try {
      await action()
      setMessage("Saved successfully")
    } catch (error) {
      const text = error instanceof Error ? error.message : "Action failed"
      if (/401|unauthor|authentication/i.test(text)) {
        window.location.assign(`/login?from=${encodeURIComponent(window.location.pathname + window.location.search)}`)
        return
      }
      setMessage(text)
    }
  }

  async function addToCart(product: Product) {
    await protectedAction(async () => {
      await apiRequest("/marketplace/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      await loadCart()
      setCartOpen(true)
    })
  }

  async function loadCart() {
    const response = await apiRequest<ApiEnvelope<CartItem[]>>("/marketplace/cart")
    setCart(response.data)
  }

  async function loadOrders() {
    const response = await apiRequest<ApiEnvelope<Order[]>>("/marketplace/orders")
    setOrders(response.data)
  }

  async function loadLibrary() {
    const [favoriteResponse, searchResponse] = await Promise.all([
      apiRequest<ApiEnvelope<Favorite[]>>("/marketplace/favorites"),
      apiRequest<ApiEnvelope<SavedSearch[]>>("/marketplace/saved-searches"),
    ])
    setFavorites(favoriteResponse.data)
    setSavedSearches(searchResponse.data)
  }

  async function toggleFavorite(product: Product) {
    await protectedAction(async () => {
      await apiRequest("/marketplace/favorites", {
        method: "POST",
        body: JSON.stringify({ productId: product.id }),
      })
      await loadLibrary()
    })
  }

  async function saveCurrentSearch() {
    if (!query.trim() && !category && !transactionType) {
      setMessage("Enter a query or choose a filter before saving.")
      return
    }
    const name = window.prompt("Name this saved search", query.trim() || category || transactionType)?.trim()
    if (!name) return
    await protectedAction(async () => {
      await apiRequest("/marketplace/saved-searches", {
        method: "POST",
        body: JSON.stringify({
          name,
          query: query.trim(),
          filters: { categoryCode: category || undefined, transactionType: transactionType || undefined },
        }),
      })
      await loadLibrary()
      setLibraryOpen(true)
    })
  }

  async function deleteSavedSearch(id: string) {
    await protectedAction(async () => {
      await apiRequest(`/marketplace/saved-searches/${id}`, { method: "DELETE" })
      await loadLibrary()
    })
  }

  function applySavedSearch(search: SavedSearch) {
    const filters = search.filters ?? {}
    setQuery(search.query ?? "")
    setCategory(typeof filters.categoryCode === "string" ? filters.categoryCode : "")
    setTransactionType(typeof filters.transactionType === "string" ? filters.transactionType : "")
    setLibraryOpen(false)
  }

  async function showReviews(product: Product) {
    const response = await apiRequest<ApiEnvelope<{ aggregate: ReviewSummary }> & { aggregate: ReviewSummary }>(`/marketplace/products/${product.id}/reviews`)
    setReviewSummary({ product, aggregate: (response.data ?? response).aggregate })
  }

  async function checkout() {
    const address = window.prompt("Delivery address")?.trim()
    if (!address) return
    await protectedAction(async () => {
      await apiRequest<ApiEnvelope<{ id: string }> & { id: string }>("/marketplace/checkout", {
        method: "POST",
        body: JSON.stringify({ deliveryAddress: { address } }),
      })
      setCart([])
      setMessage("Order created as unpaid. Online payment will be enabled later with bKash or another configured gateway.")
    })
  }

  function startVoice() {
    const Recognition = window.webkitSpeechRecognition
    if (!Recognition) {
      setMessage("Voice search is not supported by this browser. Type your request instead.")
      return
    }
    const recognition = new Recognition()
    recognition.lang = "bn-BD"
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ""
      setQuery(transcript)
    }
    recognition.onerror = () => setMessage("Could not understand the voice search. Please try again.")
    recognition.start()
  }

  const categories = [...new Set(products.map((item) => item.categoryCode))].sort()

  return (
    <main className="app-shell min-h-screen">
      <header className="glass-panel sticky top-0 z-20 border-b px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-semibold">AgriVision Store</h1><p className="text-sm text-muted-foreground">Browse without signing in. Login only when you take action.</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => void protectedAction(loadLibrary).then(() => setLibraryOpen(true))}><Heart /> Saved</Button><Button variant="outline" onClick={() => void protectedAction(loadOrders).then(() => setOrdersOpen(true))}><PackageCheck /> My orders</Button><Button variant="outline" onClick={() => void protectedAction(loadCart).then(() => setCartOpen(true))}><ShoppingCart /> Cart {cart.length ? `(${cart.length})` : ""}</Button></div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
        <Card>
          <CardContent className="grid gap-3 py-4 md:grid-cols-[1fr_180px_180px_auto]">
            <div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search crop problem, medicine, machinery or product" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            <select className="h-10 rounded-md border bg-background px-3" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
            <select className="h-10 rounded-md border bg-background px-3" value={transactionType} onChange={(e) => setTransactionType(e.target.value)}><option value="">Sale, rent or auction</option><option value="sale">Buy</option><option value="rental">Rent</option><option value="auction">Auction</option></select>
            <div className="flex gap-2"><Button onClick={() => void load()}>Search</Button><Button variant="outline" size="icon" aria-label="Save current search" onClick={() => void saveCurrentSearch()}><Heart /></Button><Button variant="outline" size="icon" aria-label="Bangla voice search" onClick={startVoice}><Mic /></Button></div>
          </CardContent>
        </Card>

        {message ? <Card><CardContent className="py-3 text-sm">{message}</CardContent></Card> : null}
        {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((x) => <div className="h-72 animate-pulse rounded-2xl border bg-muted" key={x} />)}</div> : null}
        {!loading && !products.length ? <Card><CardHeader><CardTitle>No products found</CardTitle><CardDescription>Try a simpler symptom, category, or nearby location.</CardDescription></CardHeader></Card> : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted">{product.imageUrls[0] ? <img className="h-full w-full object-cover" src={product.imageUrls[0]} alt={product.title} /> : <div className="grid h-full place-items-center text-sm text-muted-foreground">No image</div>}</div>
              <CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{product.title}</CardTitle><CardDescription>{product.categoryCode} · {product.transactionType}</CardDescription></div><Button variant="ghost" size="icon" aria-label="Save favorite" onClick={() => void toggleFavorite(product)}><Heart className={favorites.some((item) => item.productId === product.id) ? "fill-current" : ""} /></Button></div></CardHeader>
              <CardContent className="space-y-3"><p className="line-clamp-3 text-sm text-muted-foreground">{product.description}</p>{product.machineryBrand ? <p className="text-sm">{product.machineryBrand} {product.machineryModel}</p> : null}<div className="flex items-center justify-between"><strong>{product.transactionType === "rental" ? product.rentalDailyRate : product.price} {product.currency}{product.transactionType === "rental" ? "/day" : ""}</strong>{product.transactionType === "sale" ? <Button disabled={product.stock < 1} onClick={() => void addToCart(product)}>Add to cart</Button> : <Button variant="outline" onClick={() => void protectedAction(() => Promise.resolve(setMessage(product.transactionType === "rental" ? "Choose dates from the mobile app or product detail flow." : "Open the auction to place a bid.")))}>{product.transactionType === "rental" ? "Rent" : "Bid"}</Button>}</div><div className="grid grid-cols-2 gap-2"><Button variant="ghost" onClick={() => void showReviews(product)}><Star /> Reviews</Button><Button variant="ghost" onClick={() => void apiRequest<ApiEnvelope<{ items: Product[] }>>(`/marketplace/recommendations?q=${encodeURIComponent(product.title)}`).then(() => setMessage("Similar verified products loaded through low-AI search."))}><Sparkles /> Similar</Button></div></CardContent>
            </Card>
          ))}
        </div>
      </section>

      {libraryOpen ? <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setLibraryOpen(false)}><aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">Saved marketplace</h2><Button variant="ghost" onClick={() => setLibraryOpen(false)}>Close</Button></div><div className="space-y-6"><section><h3 className="mb-2 font-medium">Favorite products</h3>{favorites.length ? <div className="space-y-2">{favorites.map((item) => <Card key={item.id}><CardContent className="flex items-center justify-between gap-3 py-3"><div><strong>{item.product.title}</strong><div className="text-sm text-muted-foreground">{item.product.price} {item.product.currency}</div></div><Button variant="outline" onClick={() => void toggleFavorite(item.product)}>Remove</Button></CardContent></Card>)}</div> : <p className="text-sm text-muted-foreground">No favorites saved yet.</p>}</section><section><h3 className="mb-2 font-medium">Saved searches</h3>{savedSearches.length ? <div className="space-y-2">{savedSearches.map((item) => <Card key={item.id}><CardContent className="flex items-center justify-between gap-3 py-3"><button className="min-w-0 text-left" onClick={() => applySavedSearch(item)}><strong>{item.name}</strong><div className="truncate text-sm text-muted-foreground">{item.query || "Filtered search"}</div></button><Button variant="ghost" onClick={() => void deleteSavedSearch(item.id)}>Delete</Button></CardContent></Card>)}</div> : <p className="text-sm text-muted-foreground">No searches saved yet.</p>}</section></div></aside></div> : null}
      {cartOpen ? <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setCartOpen(false)}><aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">Your cart</h2><Button variant="ghost" onClick={() => setCartOpen(false)}>Close</Button></div>{!cart.length ? <p className="text-muted-foreground">Your cart is empty.</p> : <div className="space-y-3">{cart.map((item) => <Card key={item.id}><CardContent className="flex items-center justify-between py-3"><span>{item.productId.slice(0, 8)}</span><span>Qty {item.quantity}</span></CardContent></Card>)}<Button className="w-full" onClick={() => void checkout()}>Checkout</Button></div>}</aside></div> : null}
      {ordersOpen ? <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOrdersOpen(false)}><aside className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">My orders</h2><Button variant="ghost" onClick={() => setOrdersOpen(false)}>Close</Button></div>{!orders.length ? <p className="text-muted-foreground">No orders yet.</p> : <div className="space-y-3">{orders.map((order) => <Card key={order.id}><CardContent className="space-y-2 py-4"><div className="flex justify-between gap-3"><strong>{order.orderNumber}</strong><span>{order.total} {order.currency}</span></div><div className="text-sm text-muted-foreground">{order.status} · payment {order.paymentStatus}{order.trackingNumber ? ` · tracking ${order.trackingNumber}` : ""}</div><a className="inline-flex items-center gap-1 text-sm underline" href={`/api/marketplace/orders/${order.id}/invoice`} target="_blank" rel="noreferrer"><FileText className="size-4" /> Open invoice PDF</a></CardContent></Card>)}</div>}</aside></div> : null}
      {reviewSummary ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setReviewSummary(null)}><Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}><CardHeader><CardTitle>{reviewSummary.product.title}</CardTitle><CardDescription>Verified delivered-order reviews</CardDescription></CardHeader><CardContent className="space-y-3"><div className="text-3xl font-semibold">{reviewSummary.aggregate.average.toFixed(1)} / 5</div><p>{reviewSummary.aggregate.count} review{reviewSummary.aggregate.count === 1 ? "" : "s"}</p>{[5,4,3,2,1].map((rating) => <div className="flex justify-between text-sm" key={rating}><span>{rating} stars</span><span>{reviewSummary.aggregate.distribution[rating] ?? 0}</span></div>)}<Button className="w-full" onClick={() => setReviewSummary(null)}>Close</Button></CardContent></Card></div> : null}
    </main>
  )
}
