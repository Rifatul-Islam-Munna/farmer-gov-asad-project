"use client"

import * as React from "react"
import {
  Boxes,
  Edit3,
  Eye,
  EyeOff,
  MapPin,
  PackageCheck,
  Search,
  Store,
  TriangleAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { InventoryItem } from "@/lib/admin-api"
import { formatCurrency, formatNumber } from "@/lib/admin-format"
import { EmptyState, MetricCard, PageHeading } from "./page-elements"
import { StatusBadge } from "./status-badge"

type Change = (path: string, body: unknown, method?: string) => Promise<boolean>
const PAGE_SIZE = 12

export function InventoryPage({ inventory, change }: {
  inventory: InventoryItem[]
  change: Change
}) {
  const [query, setQuery] = React.useState("")
  const [type, setType] = React.useState("all")
  const [visibility, setVisibility] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<InventoryItem | null>(null)

  React.useEffect(() => setPage(1), [query, type, visibility])

  const types = [...new Set(inventory.map((item) => item.type))].sort()
  const normalized = query.trim().toLowerCase()
  const filtered = inventory.filter((item) => {
    const matchesQuery = !normalized || [item.shopName, item.medicineName, item.medicineCode, item.address, item.sellerId].some((value) => value.toLowerCase().includes(normalized))
    const matchesType = type === "all" || item.type === type
    const matchesVisibility = visibility === "all" || (visibility === "active" ? item.active : !item.active)
    return matchesQuery && matchesType && matchesVisibility
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const activeItems = inventory.filter((item) => item.active).length
  const lowStock = inventory.filter((item) => item.active && item.stockQuantity > 0 && item.stockQuantity <= 10).length
  const outOfStock = inventory.filter((item) => item.stockQuantity <= 0).length
  const shops = new Set(inventory.map((item) => item.sellerId)).size

  return (
    <div className="space-y-6">
      <PageHeading
        title="Seller inventory"
        description="Monitor medicine, pesticide and fertilizer availability across every registered shop."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Inventory records" value={formatNumber(inventory.length)} helper={`${shops} registered shops`} icon={Boxes} />
        <MetricCard label="Visible products" value={formatNumber(activeItems)} helper="Available to nearby farmers" icon={PackageCheck} />
        <MetricCard label="Low stock" value={formatNumber(lowStock)} helper="10 units or fewer" icon={TriangleAlert} />
        <MetricCard label="Out of stock" value={formatNumber(outOfStock)} helper="Require seller attention" icon={Store} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock directory</CardTitle>
          <CardDescription>{filtered.length} of {inventory.length} inventory records match the filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search shop, medicine, code or location" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <Select value={type} onValueChange={(value) => setType(String(value))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All product types" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All product types</SelectItem>{types.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={visibility} onValueChange={(value) => setVisibility(String(value))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All visibility" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All visibility</SelectItem><SelectItem value="active">Visible</SelectItem><SelectItem value="inactive">Hidden</SelectItem></SelectContent>
            </Select>
          </div>

          {visible.length ? (
            <>
              <Table>
                <TableHeader><TableRow><TableHead>Shop</TableHead><TableHead>Product</TableHead><TableHead>Stock</TableHead><TableHead>Price</TableHead><TableHead>Visibility</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {visible.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div className="min-w-52">
                          <p className="font-medium">{item.shopName}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{item.address}</p>
                        </div>
                      </TableCell>
                      <TableCell><p className="font-medium">{item.medicineName}</p><p className="text-xs text-muted-foreground">{item.medicineCode} · {item.type}</p></TableCell>
                      <TableCell><p className="font-medium tabular-nums">{formatNumber(item.stockQuantity)} {item.unit}</p><StatusBadge value={item.stockQuantity <= 0 ? "inactive" : item.stockQuantity <= 10 ? "pending" : "active"} /></TableCell>
                      <TableCell className="font-semibold">{formatCurrency(item.price)}<p className="text-xs font-normal text-muted-foreground">per {item.unit}</p></TableCell>
                      <TableCell><StatusBadge value={item.active ? "active" : "inactive"} /></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon-sm"
                            variant={item.active ? "outline" : "default"}
                            onClick={() => void change(`/admin/inventory/${item._id}`, { active: !item.active })}
                          >
                            {item.active ? <EyeOff /> : <Eye />}
                            <span className="sr-only">Toggle visibility</span>
                          </Button>
                          <Button size="icon-sm" variant="outline" onClick={() => setSelected(item)}><Edit3 /><span className="sr-only">Edit inventory</span></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">Page {page} of {pageCount} · {filtered.length} records</p>
                <div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</Button></div>
              </div>
            </>
          ) : (
            <EmptyState onReset={() => { setQuery(""); setType("all"); setVisibility("all") }} />
          )}
        </CardContent>
      </Card>

      <InventoryDialog
        item={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        onSave={async (body) => {
          if (!selected) return false
          const saved = await change(`/admin/inventory/${selected._id}`, body)
          if (saved) setSelected(null)
          return saved
        }}
      />
    </div>
  )
}

function InventoryDialog({ item, open, onOpenChange, onSave }: {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (body: Record<string, unknown>) => Promise<boolean>
}) {
  const [stock, setStock] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [active, setActive] = React.useState("active")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!item) return
    setStock(String(item.stockQuantity))
    setPrice(String(item.price))
    setActive(item.active ? "active" : "inactive")
  }, [item])

  if (!item) return null

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    await onSave({ stockQuantity: Number(stock), price: Number(price), active: active === "active" })
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader><DialogTitle>Edit seller stock</DialogTitle><DialogDescription>Update quantity, price and farmer visibility for this product.</DialogDescription></DialogHeader>
          <div className="my-5 rounded-2xl bg-muted/60 p-4"><p className="font-semibold">{item.medicineName}</p><p className="mt-1 text-sm text-muted-foreground">{item.shopName} · {item.address}</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`Stock quantity (${item.unit})`}><Input type="number" min="0" step="0.01" value={stock} onChange={(event) => setStock(event.target.value)} required /></Field>
            <Field label={`Price per ${item.unit}`}><Input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required /></Field>
            <div className="sm:col-span-2"><Field label="Nearby seller visibility"><Select value={active} onValueChange={(value) => setActive(String(value))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Visible to farmers</SelectItem><SelectItem value="inactive">Hidden from farmers</SelectItem></SelectContent></Select></Field></div>
          </div>
          <DialogFooter className="mt-6"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={saving}>{saving ? "Saving…" : "Save inventory"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}
