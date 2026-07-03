"use client"

import * as React from "react"
import {
  CalendarDays,
  Eye,
  MapPin,
  PackageCheck,
  Search,
  ShoppingBasket,
  TimerOff,
  Wheat,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import type { Listing, ListingStatus } from "@/lib/admin-api"
import {
  compactId,
  formatCurrency,
  formatDate,
  formatNumber,
} from "@/lib/admin-format"
import { EmptyState, MetricCard, PageHeading } from "./page-elements"
import { StatusBadge } from "./status-badge"

const statuses: ListingStatus[] = [
  "draft",
  "pendingOtp",
  "published",
  "reserved",
  "sold",
  "expired",
  "cancelled",
  "rejected",
]
const PAGE_SIZE = 12

type Change = (
  path: string,
  body: unknown,
  method?: string,
) => Promise<boolean>

export function ListingsPage({
  listings,
  change,
}: {
  listings: Listing[]
  change: Change
}) {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Listing | null>(null)

  React.useEffect(() => setPage(1), [query, status])

  const filtered = React.useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return listings.filter((listing) => {
      const matches =
        !normalized ||
        [
          listing.goodName,
          listing.goodCode,
          listing.ownerId,
          listing.address,
          listing.grade,
        ].some((value) => value?.toLowerCase().includes(normalized))
      return matches && (status === "all" || listing.status === status)
    })
  }, [listings, query, status])

  const active = listings.filter((listing) =>
    ["published", "reserved"].includes(listing.status),
  ).length
  const sold = listings.filter((listing) => listing.status === "sold").length
  const expired = listings.filter((listing) =>
    ["expired", "cancelled", "rejected"].includes(listing.status),
  ).length
  const totalQuantity = listings.reduce(
    (sum, listing) => sum + Number(listing.quantity || 0),
    0,
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <PageHeading
        title="Marketplace listings"
        description="Review every crop listing, compare prices and control its marketplace lifecycle."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total listings"
          value={formatNumber(listings.length)}
          helper={`${formatNumber(totalQuantity)} total units listed`}
          icon={ShoppingBasket}
        />
        <MetricCard
          label="Active supply"
          value={formatNumber(active)}
          helper="Published and reserved listings"
          icon={PackageCheck}
        />
        <MetricCard
          label="Sold listings"
          value={formatNumber(sold)}
          helper="Completed marketplace supply"
          icon={Wheat}
        />
        <MetricCard
          label="Closed or rejected"
          value={formatNumber(expired)}
          helper="Expired, cancelled or rejected"
          icon={TimerOff}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing directory</CardTitle>
          <CardDescription>
            {filtered.length} of {listings.length} listings match the current filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search good, owner, grade or location"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => setStatus(String(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All listing statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All listing statuses</SelectItem>
                {statuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item.replace(/([A-Z])/g, " $1")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {visible.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price comparison</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((listing) => (
                    <TableRow key={listing._id}>
                      <TableCell>
                        <div className="min-w-52">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{listing.goodName}</p>
                            {listing.grade ? (
                              <Badge variant="outline">Grade {listing.grade}</Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            {compactId(listing._id)} · {listing.goodCode}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Owner {compactId(listing.ownerId)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium tabular-nums">
                          {formatNumber(listing.quantity)} {listing.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(listing.reservedQuantity)} reserved
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-44 text-sm">
                          <p>Minimum {formatCurrency(listing.minimumPrice)}</p>
                          <p className="text-xs text-muted-foreground">
                            Market {formatCurrency(listing.marketPrice)} · Gov. {formatCurrency(listing.governmentPrice)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-44 items-start gap-2 text-sm">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <span>{listing.address || "No address provided"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={listing.status} />
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="size-3" />
                          {formatDate(listing.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(listing)}
                        >
                          <Eye />
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {pageCount} · {filtered.length} records
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pageCount}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
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

      <ListingDialog
        listing={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        onSave={async (nextStatus) => {
          if (!selected) return false
          const saved = await change(`/admin/listings/${selected._id}`, {
            status: nextStatus,
          })
          if (saved) setSelected(null)
          return saved
        }}
      />
    </div>
  )
}

function ListingDialog({
  listing,
  open,
  onOpenChange,
  onSave,
}: {
  listing: Listing | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (status: ListingStatus) => Promise<boolean>
}) {
  const [status, setStatus] = React.useState<ListingStatus>("published")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (listing) setStatus(listing.status)
  }, [listing])

  if (!listing) return null

  async function save() {
    setSaving(true)
    await onSave(status)
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage listing</DialogTitle>
          <DialogDescription>
            Review marketplace details and update the listing status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="rounded-2xl bg-muted/60 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xl font-semibold">{listing.goodName}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {listing._id}
                </p>
              </div>
              <StatusBadge value={listing.status} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Owner ID" value={listing.ownerId} mono />
            <Detail label="Good code" value={listing.goodCode} />
            <Detail
              label="Available quantity"
              value={`${formatNumber(listing.quantity)} ${listing.unit}`}
            />
            <Detail
              label="Reserved quantity"
              value={`${formatNumber(listing.reservedQuantity)} ${listing.unit}`}
            />
            <Detail
              label="Minimum price"
              value={formatCurrency(listing.minimumPrice)}
            />
            <Detail
              label="Market price"
              value={formatCurrency(listing.marketPrice)}
            />
            <Detail
              label="Government price"
              value={formatCurrency(listing.governmentPrice)}
            />
            <Detail label="Harvest date" value={formatDate(listing.harvestDate)} />
            <div className="sm:col-span-2">
              <Detail label="Address" value={listing.address || "Not provided"} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Listing status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(String(value) as ListingStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item.replace(/([A-Z])/g, " $1")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={mono ? "mt-1 break-all font-mono text-xs" : "mt-1 font-medium"}>
        {value}
      </p>
    </div>
  )
}
