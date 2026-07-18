"use client"

import * as React from "react"
import { FileText, RefreshCcw, ShieldAlert, Star, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiRequest, type ApiEnvelope } from "@/lib/admin-api"

type Product = {
  id: string
  sellerId: string
  title: string
  categoryCode: string
  price: number
  status: string
  restrictedProduct: boolean
  requiresLicense: boolean
  licenseVerified: boolean
  moderationReason?: string
  appealStatus: string
  appealMessage?: string
  moderatedBy?: string
  moderatedAt?: string
  moderationEvidenceUrls?: string[]
  moderationAuditNotes?: string
  moderationHistory?: Array<{ actorId: string; status: string; reason: string; auditNotes?: string; evidenceUrls: string[]; createdAt: string }>
}
type Order = {
  id: string
  orderNumber: string
  buyerId: string
  total: number
  currency: string
  status: string
  paymentStatus: string
  trackingNumber?: string
}
type Payment = { id: string; orderId: string; provider: string; amount: number; currency: string; status: string; providerReference: string }
type Refund = { id: string; orderId: string; paymentId: string; amount: number; status: string; reason: string; providerReference?: string }
type BulkRequest = {
  id: string
  buyerId: string
  title: string
  categoryCode: string
  quantity: number
  unit: string
  status: string
  selectedOfferId?: string
}
type Review = {
  id: string
  productId: string
  reviewerId: string
  rating: number
  comment?: string
  status: "published" | "hidden"
}

export function MarketplaceManagementPanel() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [orders, setOrders] = React.useState<Order[]>([])
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [bulkRequests, setBulkRequests] = React.useState<BulkRequest[]>([])
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [refunds, setRefunds] = React.useState<Refund[]>([])
  const [loading, setLoading] = React.useState(true)
  const [message, setMessage] = React.useState("")

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [p, o, r, b, pay, ref] = await Promise.all([
        apiRequest<ApiEnvelope<Product[]>>("/marketplace/admin/products"),
        apiRequest<ApiEnvelope<Order[]>>("/marketplace/admin/orders"),
        apiRequest<ApiEnvelope<Review[]>>("/marketplace/admin/reviews"),
        apiRequest<ApiEnvelope<BulkRequest[]>>("/marketplace/admin/bulk-requests"),
        apiRequest<ApiEnvelope<Payment[]>>("/billing/admin/payments"),
        apiRequest<ApiEnvelope<Refund[]>>("/billing/admin/refunds"),
      ])
      setProducts(p.data)
      setOrders(o.data)
      setReviews(r.data)
      setBulkRequests(b.data)
      setPayments(pay.data)
      setRefunds(ref.data)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load marketplace administration")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  async function moderate(product: Product, status: "published" | "rejected" | "suspended") {
    const reason = window.prompt(`Reason for ${status}`, product.moderationReason ?? "")?.trim()
    if (!reason) return
    const evidence = window.prompt("Evidence URLs (comma-separated)", product.moderationEvidenceUrls?.join(", ") ?? "") ?? ""
    const auditNotes = window.prompt("Internal audit notes", product.moderationAuditNotes ?? "") ?? ""
    try {
      await apiRequest(`/marketplace/admin/products/${product.id}/moderate`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          reason,
          licenseVerified: product.licenseVerified || !product.requiresLicense,
          evidenceUrls: evidence.split(",").map((item) => item.trim()).filter(Boolean),
          auditNotes: auditNotes.trim() || undefined,
        }),
      })
      setMessage("Product moderation saved.")
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not moderate product")
    }
  }

  async function moderateReview(review: Review, status: "published" | "hidden") {
    try {
      await apiRequest(`/marketplace/admin/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      setMessage(`Review ${status}.`)
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not moderate review")
    }
  }

  async function updateOrder(order: Order, status: string, trackingNumber?: string) {
    try {
      await apiRequest(`/marketplace/orders/${order.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, trackingNumber }),
      })
      setMessage("Order status updated.")
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update order")
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Marketplace operations</h2><p className="text-sm text-muted-foreground">Moderation, restricted products, appeals, orders, delivery and payments.</p></div><Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCcw className={loading ? "animate-spin" : ""} /> Refresh</Button></div>
      {message ? <Card><CardContent className="py-3 text-sm">{message}</CardContent></Card> : null}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert /> Product moderation</CardTitle><CardDescription>Products cannot be published without a reason. Restricted licensed items require verified documentation.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {!products.length ? <p className="text-sm text-muted-foreground">No generalized marketplace products.</p> : products.map((product) => (
            <div className="grid gap-3 rounded-xl border p-4 lg:grid-cols-[1fr_150px_auto]" key={product.id}>
              <div><div className="font-medium">{product.title}</div><div className="text-sm text-muted-foreground">{product.categoryCode} · {product.price} BDT · seller {product.sellerId.slice(0, 8)}</div><div className="mt-1 text-xs">Status: {product.status} · Appeal: {product.appealStatus}{product.restrictedProduct ? " · Restricted" : ""}{product.requiresLicense ? ` · License ${product.licenseVerified ? "verified" : "required"}` : ""}</div>{product.appealMessage ? <p className="mt-2 rounded-md bg-muted p-2 text-sm">Appeal: {product.appealMessage}</p> : null}{product.moderationReason ? <p className="mt-2 text-sm text-muted-foreground">Last reason: {product.moderationReason}</p> : null}{product.moderatedBy ? <p className="text-xs text-muted-foreground">Reviewer: {product.moderatedBy} {product.moderatedAt ? `? ${new Date(product.moderatedAt).toLocaleString()}` : ""}</p> : null}{product.moderationAuditNotes ? <p className="mt-1 rounded-md bg-muted p-2 text-xs">Audit notes: {product.moderationAuditNotes}</p> : null}{product.moderationEvidenceUrls?.length ? <div className="mt-1 text-xs">Evidence: {product.moderationEvidenceUrls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="mr-2 underline">Open</a>)}</div> : null}</div>
              <Button variant={product.licenseVerified ? "default" : "outline"} disabled={!product.requiresLicense} onClick={() => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, licenseVerified: !item.licenseVerified } : item))}>{product.licenseVerified ? "License verified" : "Verify license"}</Button>
              <div className="flex flex-wrap gap-2"><Button onClick={() => void moderate(product, "published")}>Approve</Button><Button variant="outline" onClick={() => void moderate(product, "rejected")}>Reject</Button><Button variant="destructive" onClick={() => void moderate(product, "suspended")}>Suspend</Button></div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bulk purchase oversight</CardTitle><CardDescription>Monitor open requests, matched offers and buyer selections.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {!bulkRequests.length ? <p className="text-sm text-muted-foreground">No bulk requests.</p> : bulkRequests.map((request) => (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4" key={request.id}>
              <div><div className="font-medium">{request.title}</div><div className="text-sm text-muted-foreground">{request.quantity} {request.unit} · {request.categoryCode} · buyer {request.buyerId.slice(0, 8)}</div><div className="text-xs">Status: {request.status}{request.selectedOfferId ? ` · selected offer ${request.selectedOfferId.slice(0, 8)}` : ""}</div></div>
              <a className="text-sm underline" href={`/marketplace/bulk-requests/${request.id}`} target="_blank" rel="noreferrer">View offers</a>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Star /> Review moderation</CardTitle><CardDescription>Hide abusive or irrelevant reviews without deleting audit history.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {!reviews.length ? <p className="text-sm text-muted-foreground">No product reviews.</p> : reviews.map((review) => (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4" key={review.id}>
              <div><div className="font-medium">{review.rating}/5 stars · product {review.productId.slice(0, 8)}</div><div className="text-sm text-muted-foreground">{review.comment || "No comment"}</div><div className="text-xs">Status: {review.status}</div></div>
              <Button variant={review.status === "published" ? "outline" : "default"} onClick={() => void moderateReview(review, review.status === "published" ? "hidden" : "published")}>{review.status === "published" ? "Hide" : "Publish"}</Button>
            </div>
          ))}
        </CardContent>
      </Card>


      <Card>
        <CardHeader><CardTitle>Payments and refunds</CardTitle><CardDescription>Read-only operational oversight for gateway records and refund outcomes.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <section><h3 className="mb-2 font-medium">Payments</h3>{payments.length ? <div className="space-y-2">{payments.map((payment) => <div key={payment.id} className="rounded-xl border p-3 text-sm"><strong>{payment.amount} {payment.currency}</strong> ? {payment.provider} ? {payment.status}<div className="text-xs text-muted-foreground">Order {payment.orderId} ? Ref {payment.providerReference}</div></div>)}</div> : <p className="text-sm text-muted-foreground">No payment records.</p>}</section>
          <section><h3 className="mb-2 font-medium">Refunds</h3>{refunds.length ? <div className="space-y-2">{refunds.map((refund) => <div key={refund.id} className="rounded-xl border p-3 text-sm"><strong>{refund.amount}</strong> ? {refund.status}<div>{refund.reason}</div><div className="text-xs text-muted-foreground">Order {refund.orderId}{refund.providerReference ? ` ? Ref ${refund.providerReference}` : ""}</div></div>)}</div> : <p className="text-sm text-muted-foreground">No refund records.</p>}</section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Truck /> Orders and delivery</CardTitle><CardDescription>Update operational status and tracking. Payment state is changed only by signed payment callbacks or refund processing.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {!orders.length ? <p className="text-sm text-muted-foreground">No marketplace orders.</p> : orders.map((order) => (
            <OrderRow key={order.id} order={order} save={updateOrder} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function OrderRow({ order, save }: { order: Order; save: (order: Order, status: string, tracking?: string) => Promise<void> }) {
  const [status, setStatus] = React.useState(order.status)
  const [tracking, setTracking] = React.useState(order.trackingNumber ?? "")
  return <div className="grid gap-3 rounded-xl border p-4 lg:grid-cols-[1fr_180px_220px_auto]"><div><div className="font-medium">{order.orderNumber}</div><div className="text-sm text-muted-foreground">{order.total} {order.currency} · payment {order.paymentStatus}</div><a className="mt-2 inline-flex items-center gap-1 text-sm underline" href={`/api/marketplace/orders/${order.id}/invoice`} target="_blank" rel="noreferrer"><FileText className="size-4" /> Invoice PDF</a></div><select className="h-10 rounded-md border bg-background px-3" value={status} onChange={(e) => setStatus(e.target.value)}>{["pending","confirmed","processing","shipped","delivered","cancelled"].map((item) => <option key={item}>{item}</option>)}</select><Input placeholder="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} /><Button onClick={() => void save(order, status, tracking || undefined)}>Save</Button></div>
}
