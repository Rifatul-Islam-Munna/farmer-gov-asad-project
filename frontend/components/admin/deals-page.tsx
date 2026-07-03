"use client"

import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  Handshake,
  Search,
  Timer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Deal, DealStatus, Offer } from "@/lib/admin-api"
import {
  compactId,
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "@/lib/admin-format"
import { EmptyState, MetricCard, PageHeading } from "./page-elements"
import { StatusBadge } from "./status-badge"

const dealStatuses: DealStatus[] = [
  "confirmed",
  "completed",
  "cancelled",
  "disputed",
]
const PAGE_SIZE = 12

type Change = (
  path: string,
  body: unknown,
  method?: string,
) => Promise<boolean>

export function DealsPage({
  deals,
  offers,
  change,
}: {
  deals: Deal[]
  offers: Offer[]
  change: Change
}) {
  const [tab, setTab] = React.useState("deals")
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Deal | null>(null)

  React.useEffect(() => setPage(1), [query, status, tab])

  const completed = deals.filter((deal) => deal.status === "completed").length
  const disputed = deals.filter((deal) => deal.status === "disputed").length
  const openOffers = offers.filter((offer) =>
    ["pending", "countered", "acceptedByBuyer", "acceptedByFarmer"].includes(
      offer.status,
    ),
  ).length
  const volume = deals
    .filter((deal) => deal.status !== "cancelled")
    .reduce((sum, deal) => sum + Number(deal.totalPrice || 0), 0)

  const normalized = query.trim().toLowerCase()
  const filteredDeals = deals.filter((deal) => {
    const matches =
      !normalized ||
      [deal._id, deal.buyerId, deal.farmerId, deal.listingId, deal.offerId].some(
        (value) => value.toLowerCase().includes(normalized),
      )
    return matches && (status === "all" || deal.status === status)
  })
  const filteredOffers = offers.filter((offer) => {
    const matches =
      !normalized ||
      [offer._id, offer.buyerId, offer.farmerId, offer.listingId].some((value) =>
        value.toLowerCase().includes(normalized),
      )
    return matches && (status === "all" || offer.status === status)
  })
  const source = tab === "deals" ? filteredDeals : filteredOffers
  const pageCount = Math.max(1, Math.ceil(source.length / PAGE_SIZE))
  const visibleDeals = filteredDeals.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  )
  const visibleOffers = filteredOffers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  )

  return (
    <div className="space-y-6">
      <PageHeading
        title="Deals and negotiations"
        description="Monitor every offer, confirmed sale, dispute and completed transaction."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Deal volume"
          value={formatCurrency(volume)}
          helper="All non-cancelled transactions"
          icon={CircleDollarSign}
        />
        <MetricCard
          label="Completed deals"
          value={formatNumber(completed)}
          helper={`${deals.length} total confirmed deals`}
          icon={CheckCircle2}
        />
        <MetricCard
          label="Open negotiations"
          value={formatNumber(openOffers)}
          helper={`${offers.length} offers in total`}
          icon={Timer}
        />
        <MetricCard
          label="Disputed deals"
          value={formatNumber(disputed)}
          helper="Require administrator attention"
          icon={AlertTriangle}
        />
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <TabsList>
            <TabsTrigger value="deals">
              <Handshake />
              Deals ({deals.length})
            </TabsTrigger>
            <TabsTrigger value="offers">
              <Timer />
              Offers ({offers.length})
            </TabsTrigger>
          </TabsList>

          <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_210px] xl:w-[620px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search deal, listing, buyer or farmer ID"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => setStatus(String(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(tab === "deals"
                  ? dealStatuses
                  : [
                      "pending",
                      "countered",
                      "acceptedByBuyer",
                      "acceptedByFarmer",
                      "confirmed",
                      "rejected",
                      "cancelled",
                      "expired",
                    ]
                ).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item.replace(/([A-Z])/g, " $1")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="deals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Confirmed deals</CardTitle>
              <CardDescription>
                Update fulfillment status and inspect transaction values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visibleDeals.length ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Deal</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Quantity and price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Manage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleDeals.map((deal) => (
                        <TableRow key={deal._id}>
                          <TableCell>
                            <p className="font-mono text-xs">
                              {compactId(deal._id)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDateTime(deal.confirmedAt)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-44 text-xs">
                              <p>Buyer {compactId(deal.buyerId)}</p>
                              <p className="mt-1 text-muted-foreground">
                                Farmer {compactId(deal.farmerId)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">
                              {formatNumber(deal.quantity)} units
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(deal.unitPrice)} each
                            </p>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(deal.totalPrice)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge value={deal.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelected(deal)}
                            >
                              <Eye />
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Pagination
                    page={page}
                    pageCount={pageCount}
                    total={filteredDeals.length}
                    onPage={setPage}
                  />
                </>
              ) : (
                <EmptyState
                  onReset={() => {
                    setQuery("")
                    setStatus("all")
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Negotiation offers</CardTitle>
              <CardDescription>
                Read buyer and farmer acceptance state for every offer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visibleOffers.length ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Offer</TableHead>
                        <TableHead>Listing</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Proposed value</TableHead>
                        <TableHead>Acceptance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleOffers.map((offer) => (
                        <TableRow key={offer._id}>
                          <TableCell>
                            <p className="font-mono text-xs">
                              {compactId(offer._id)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDateTime(offer.createdAt)}
                            </p>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {compactId(offer.listingId)}
                          </TableCell>
                          <TableCell>
                            <div className="min-w-44 text-xs">
                              <p>Buyer {compactId(offer.buyerId)}</p>
                              <p className="mt-1 text-muted-foreground">
                                Farmer {compactId(offer.farmerId)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">
                              {formatNumber(offer.quantity)} units
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(offer.unitPrice)} each
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              <StatusBadge
                                value={
                                  offer.buyerAccepted ? "approved" : "pending"
                                }
                              />
                              <StatusBadge
                                value={
                                  offer.farmerAccepted ? "approved" : "pending"
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge value={offer.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Pagination
                    page={page}
                    pageCount={pageCount}
                    total={filteredOffers.length}
                    onPage={setPage}
                  />
                </>
              ) : (
                <EmptyState
                  onReset={() => {
                    setQuery("")
                    setStatus("all")
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DealDialog
        deal={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        onSave={async (nextStatus) => {
          if (!selected) return false
          const saved = await change(`/admin/deals/${selected._id}`, {
            status: nextStatus,
          })
          if (saved) setSelected(null)
          return saved
        }}
      />
    </div>
  )
}

function DealDialog({
  deal,
  open,
  onOpenChange,
  onSave,
}: {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (status: DealStatus) => Promise<boolean>
}) {
  const [status, setStatus] = React.useState<DealStatus>("confirmed")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (deal) setStatus(deal.status)
  }, [deal])

  if (!deal) return null

  async function save() {
    setSaving(true)
    await onSave(status)
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage deal</DialogTitle>
          <DialogDescription>
            Change the transaction state after reviewing fulfillment details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4 sm:grid-cols-2">
          <Info label="Deal ID" value={deal._id} />
          <Info label="Listing ID" value={deal.listingId} />
          <Info label="Buyer ID" value={deal.buyerId} />
          <Info label="Farmer ID" value={deal.farmerId} />
          <Info
            label="Quantity"
            value={`${formatNumber(deal.quantity)} units`}
          />
          <Info label="Unit price" value={formatCurrency(deal.unitPrice)} />
          <div className="sm:col-span-2">
            <Info label="Total transaction value" value={formatCurrency(deal.totalPrice)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Deal status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(String(value) as DealStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dealStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save deal status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-all font-medium">{value}</p>
    </div>
  )
}

function Pagination({
  page,
  pageCount,
  total,
  onPage,
}: {
  page: number
  pageCount: number
  total: number
  onPage: (page: number) => void
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount} · {total} records
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
