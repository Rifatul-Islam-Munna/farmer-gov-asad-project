"use client"

import { Boxes, Handshake, ShoppingBasket, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AdminDataSnapshot } from "@/lib/admin-api"
import { formatCurrency, formatNumber } from "@/lib/admin-format"
import { MetricCard, PageHeading } from "./page-elements"

const statusConfig = {
  value: { label: "Records", color: "var(--chart-1)" },
} satisfies ChartConfig

export function ReportsPage({ data }: { data: AdminDataSnapshot }) {
  const userRoles = countBy(data.users.map((item) => item.role))
  const listingStatuses = countBy(data.listings.map((item) => item.status))
  const dealStatuses = countBy(data.deals.map((item) => item.status))
  const inventoryTypes = countBy(data.inventory.map((item) => item.type))
  const dealVolume = data.deals
    .filter((deal) => deal.status !== "cancelled")
    .reduce((sum, deal) => sum + Number(deal.totalPrice || 0), 0)
  const availableStock = data.inventory
    .filter((item) => item.active)
    .reduce((sum, item) => sum + Number(item.stockQuantity || 0), 0)

  const reportRows = [
    ["User accounts", data.users.length, "Roles and verification"],
    ["Marketplace listings", data.listings.length, "Supply and listing status"],
    ["Negotiation offers", data.offers.length, "Buyer and farmer acceptance"],
    ["Confirmed deals", data.deals.length, "Sales and fulfillment"],
    ["Market prices", data.prices.length, "Government and regional rates"],
    ["Seller inventory", data.inventory.length, "Shop stock and availability"],
  ] as const

  return (
    <div className="space-y-6">
      <PageHeading
        title="Reports and analytics"
        description="Analyze platform composition, operational status and marketplace performance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Users"
          value={formatNumber(data.users.length)}
          helper={`${formatNumber(data.users.filter((user) => user.verificationStatus === "pending").length)} pending verification`}
          icon={Users}
        />
        <MetricCard
          label="Listings"
          value={formatNumber(data.listings.length)}
          helper={`${formatNumber(data.listings.filter((listing) => ["published", "reserved"].includes(listing.status)).length)} active supply records`}
          icon={ShoppingBasket}
        />
        <MetricCard
          label="Deal volume"
          value={formatCurrency(dealVolume)}
          helper={`${formatNumber(data.deals.length)} total deals`}
          icon={Handshake}
        />
        <MetricCard
          label="Available seller stock"
          value={formatNumber(availableStock)}
          helper={`${formatNumber(data.inventory.length)} inventory records`}
          icon={Boxes}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BreakdownChart title="Users by role" data={userRoles} />
        <BreakdownChart title="Listings by status" data={listingStatuses} />
        <BreakdownChart title="Deals by status" data={dealStatuses} />
        <BreakdownChart title="Inventory by product type" data={inventoryTypes} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available administration reports</CardTitle>
          <CardDescription>
            Live record totals used throughout the dashboard and management pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead className="text-right">Records</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportRows.map(([title, records, scope]) => (
                <TableRow key={title}>
                  <TableCell className="font-medium">{title}</TableCell>
                  <TableCell className="text-muted-foreground">{scope}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatNumber(records)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function BreakdownChart({
  title,
  data,
}: {
  title: string
  data: Array<{ label: string; value: number }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Current live record distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={statusConfig} className="h-[280px] w-full">
          <BarChart data={data} margin={{ left: 4, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={28} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function countBy(values: string[]) {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts.entries()]
    .map(([label, value]) => ({ label: label.replace(/([A-Z])/g, " $1"), value }))
    .sort((a, b) => b.value - a.value)
}
