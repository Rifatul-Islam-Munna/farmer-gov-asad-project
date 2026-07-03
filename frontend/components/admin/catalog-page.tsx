"use client"

import * as React from "react"
import { BadgeDollarSign, Edit3, Plus, Search, Tags, TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Good, GoodsCategory, MarketPrice } from "@/lib/admin-api"
import { formatCurrency, formatDate, formatNumber } from "@/lib/admin-format"
import { EmptyState, MetricCard, PageHeading } from "./page-elements"
import { StatusBadge } from "./status-badge"

type Change = (path: string, body: unknown, method?: string) => Promise<boolean>

type PriceForm = {
  goodCode: string
  goodName: string
  unit: string
  governmentPrice: string
  marketPrice: string
  previousMarketPrice: string
  region: string
  marketName: string
  priceDate: string
}

type GoodForm = {
  code: string
  name: string
  localName: string
  categoryCode: string
  defaultUnit: string
  imageUrl: string
  active: boolean
}

const emptyPrice: PriceForm = {
  goodCode: "",
  goodName: "",
  unit: "kg",
  governmentPrice: "",
  marketPrice: "",
  previousMarketPrice: "",
  region: "National",
  marketName: "Government Reference Market",
  priceDate: new Date().toISOString().slice(0, 10),
}

const emptyGood: GoodForm = {
  code: "",
  name: "",
  localName: "",
  categoryCode: "vegetable",
  defaultUnit: "kg",
  imageUrl: "",
  active: true,
}

export function CatalogPage({ prices, goods, categories, change }: {
  prices: MarketPrice[]
  goods: Good[]
  categories: GoodsCategory[]
  change: Change
}) {
  const [tab, setTab] = React.useState("prices")
  const [query, setQuery] = React.useState("")
  const [priceDialog, setPriceDialog] = React.useState<MarketPrice | "new" | null>(null)
  const [goodDialog, setGoodDialog] = React.useState<Good | "new" | null>(null)
  const normalized = query.trim().toLowerCase()
  const filteredPrices = prices.filter((item) =>
    [item.goodName, item.goodCode, item.region, item.marketName].some((value) => value.toLowerCase().includes(normalized)),
  )
  const filteredGoods = goods.filter((item) =>
    [item.name, item.code, item.localName, item.categoryCode].some((value) => value?.toLowerCase().includes(normalized)),
  )
  const rising = prices.filter((item) => item.marketPrice > item.previousMarketPrice).length
  const falling = prices.filter((item) => item.marketPrice < item.previousMarketPrice).length

  return (
    <div className="space-y-6">
      <PageHeading
        title="Prices and goods catalog"
        description="Maintain government reference rates, regional market prices and all goods available in the platform."
        actions={
          <Button onClick={() => tab === "prices" ? setPriceDialog("new") : setGoodDialog("new")}>
            <Plus /> Add {tab === "prices" ? "price" : "good"}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Price records" value={formatNumber(prices.length)} helper="Government and market references" icon={BadgeDollarSign} />
        <MetricCard label="Rising prices" value={formatNumber(rising)} helper="Above the previous market rate" icon={TrendingUp} />
        <MetricCard label="Falling prices" value={formatNumber(falling)} helper="Below the previous market rate" icon={TrendingDown} />
        <MetricCard label="Active goods" value={formatNumber(goods.filter((item) => item.active).length)} helper={`${categories.length} categories`} icon={Tags} />
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <TabsList>
            <TabsTrigger value="prices"><BadgeDollarSign /> Market prices</TabsTrigger>
            <TabsTrigger value="goods"><Tags /> Goods catalog</TabsTrigger>
          </TabsList>
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder={tab === "prices" ? "Search good, region or market" : "Search good, code or category"} value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>

        <TabsContent value="prices" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Market price records</CardTitle><CardDescription>Government references and current regional market rates.</CardDescription></CardHeader>
            <CardContent>
              {filteredPrices.length ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Good</TableHead><TableHead>Region and market</TableHead><TableHead>Government</TableHead><TableHead>Previous</TableHead><TableHead>Current</TableHead><TableHead>Trend</TableHead><TableHead className="text-right">Edit</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredPrices.map((price) => {
                      const difference = price.marketPrice - price.previousMarketPrice
                      return (
                        <TableRow key={price._id}>
                          <TableCell><p className="font-medium">{price.goodName}</p><p className="text-xs text-muted-foreground">{price.goodCode} · per {price.unit}</p></TableCell>
                          <TableCell><p>{price.region}</p><p className="text-xs text-muted-foreground">{price.marketName} · {formatDate(price.priceDate)}</p></TableCell>
                          <TableCell>{formatCurrency(price.governmentPrice)}</TableCell>
                          <TableCell>{formatCurrency(price.previousMarketPrice)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(price.marketPrice)}</TableCell>
                          <TableCell><Badge variant="outline" className={difference > 0 ? "border-rose-200 bg-rose-50 text-rose-700" : difference < 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>{difference > 0 ? "+" : ""}{formatCurrency(difference)}</Badge></TableCell>
                          <TableCell className="text-right"><Button variant="outline" size="icon-sm" onClick={() => setPriceDialog(price)}><Edit3 /><span className="sr-only">Edit price</span></Button></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : <EmptyState onReset={() => setQuery("")} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goods" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Goods catalog</CardTitle><CardDescription>All crops and goods that farmers can list in the marketplace.</CardDescription></CardHeader>
            <CardContent>
              {filteredGoods.length ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Good</TableHead><TableHead>Code</TableHead><TableHead>Category</TableHead><TableHead>Default unit</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Edit</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredGoods.map((good) => (
                      <TableRow key={good._id}>
                        <TableCell><p className="font-medium">{good.name}</p><p className="text-xs text-muted-foreground">{good.localName || "No local name"}</p></TableCell>
                        <TableCell className="font-mono text-xs">{good.code}</TableCell>
                        <TableCell>{good.categoryCode}</TableCell>
                        <TableCell>{good.defaultUnit}</TableCell>
                        <TableCell><StatusBadge value={good.active ? "active" : "inactive"} /></TableCell>
                        <TableCell className="text-right"><Button variant="outline" size="icon-sm" onClick={() => setGoodDialog(good)}><Edit3 /><span className="sr-only">Edit good</span></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <EmptyState onReset={() => setQuery("")} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PriceDialog
        value={priceDialog}
        open={priceDialog !== null}
        onOpenChange={(open) => !open && setPriceDialog(null)}
        onSave={async (body) => {
          const saved = await change("/admin/prices", body, "POST")
          if (saved) setPriceDialog(null)
          return saved
        }}
      />
      <GoodDialog
        value={goodDialog}
        categories={categories}
        open={goodDialog !== null}
        onOpenChange={(open) => !open && setGoodDialog(null)}
        onSave={async (body) => {
          const saved = await change("/admin/goods", body, "POST")
          if (saved) setGoodDialog(null)
          return saved
        }}
      />
    </div>
  )
}

function PriceDialog({ value, open, onOpenChange, onSave }: {
  value: MarketPrice | "new" | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (body: Record<string, unknown>) => Promise<boolean>
}) {
  const [form, setForm] = React.useState<PriceForm>(emptyPrice)
  const [saving, setSaving] = React.useState(false)
  React.useEffect(() => {
    setForm(value && value !== "new" ? {
      goodCode: value.goodCode,
      goodName: value.goodName,
      unit: value.unit,
      governmentPrice: String(value.governmentPrice),
      marketPrice: String(value.marketPrice),
      previousMarketPrice: String(value.previousMarketPrice),
      region: value.region,
      marketName: value.marketName,
      priceDate: value.priceDate.slice(0, 10),
    } : emptyPrice)
  }, [value])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    await onSave({ ...form, governmentPrice: Number(form.governmentPrice), marketPrice: Number(form.marketPrice), previousMarketPrice: Number(form.previousMarketPrice) })
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={submit}>
          <DialogHeader><DialogTitle>{value === "new" ? "Add market price" : "Edit market price"}</DialogTitle><DialogDescription>Save the latest government and regional market values.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-5 sm:grid-cols-2">
            {(["goodCode", "goodName", "unit", "region", "marketName"] as const).map((key) => <Field key={key} label={key.replace(/([A-Z])/g, " $1")}><Input value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} required /></Field>)}
            {(["governmentPrice", "marketPrice", "previousMarketPrice"] as const).map((key) => <Field key={key} label={key.replace(/([A-Z])/g, " $1")}><Input type="number" min="0" step="0.01" value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} required /></Field>)}
            <Field label="Price date"><Input type="date" value={form.priceDate} onChange={(event) => setForm((current) => ({ ...current, priceDate: event.target.value }))} required /></Field>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={saving}>{saving ? "Saving…" : "Save price"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function GoodDialog({ value, categories, open, onOpenChange, onSave }: {
  value: Good | "new" | null
  categories: GoodsCategory[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (body: Record<string, unknown>) => Promise<boolean>
}) {
  const [form, setForm] = React.useState<GoodForm>(emptyGood)
  const [saving, setSaving] = React.useState(false)
  React.useEffect(() => {
    setForm(value && value !== "new" ? {
      code: value.code,
      name: value.name,
      localName: value.localName ?? "",
      categoryCode: value.categoryCode,
      defaultUnit: value.defaultUnit,
      imageUrl: value.imageUrl ?? "",
      active: value.active,
    } : emptyGood)
  }, [value])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    await onSave({ ...form, localName: form.localName || undefined, imageUrl: form.imageUrl || undefined })
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader><DialogTitle>{value === "new" ? "Add good" : "Edit good"}</DialogTitle><DialogDescription>Maintain the marketplace goods catalog.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-5 sm:grid-cols-2">
            {(["code", "name", "localName", "defaultUnit", "imageUrl"] as const).map((key) => <Field key={key} label={key.replace(/([A-Z])/g, " $1")}><Input value={String(form[key])} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} required={key === "code" || key === "name" || key === "defaultUnit"} /></Field>)}
            <Field label="Category"><Select value={form.categoryCode} onValueChange={(value) => setForm((current) => ({ ...current, categoryCode: String(value) }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{categories.length ? categories.map((item) => <SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>) : <SelectItem value="vegetable">Vegetable</SelectItem>}</SelectContent></Select></Field>
            <Field label="Visibility"><Select value={form.active ? "active" : "inactive"} onValueChange={(value) => setForm((current) => ({ ...current, active: value === "active" }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></Field>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={saving}>{saving ? "Saving…" : "Save good"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="capitalize">{label}</Label>{children}</div>
}
