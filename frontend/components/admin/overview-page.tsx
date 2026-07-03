"use client"

import {
  ArrowRight,
  Boxes,
  CircleDollarSign,
  Handshake,
  ListChecks,
  ShoppingBasket,
  UserCheck,
  Users,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { DashboardData } from "@/lib/admin-api"
import {
  compactId,
  formatCurrency,
  formatDate,
  formatNumber,
  percent,
} from "@/lib/admin-format"
import type { AdminView } from "./admin-shell"
import { MetricCard, PageHeading, PageSkeleton } from "./page-elements"
import { StatusBadge } from "./status-badge"

const activityConfig = {
  deals: { label: "Deals", color: "var(--chart-1)" },
  listings: { label: "Listings", color: "var(--chart-2)" },
} satisfies ChartConfig

const roleConfig = {
  value: { label: "Users", color: "var(--chart-3)" },
} satisfies ChartConfig

export function OverviewPage({
  data,
  onNavigate,
}: {
  data: DashboardData | null
  onNavigate: (view: AdminView) => void
}) {
  if (!data) return <PageSkeleton />

  const metrics = data.metrics
  const verificationRate = percent(
    Math.max(metrics.totalUsers - metrics.pendingUsers, 0),
    metrics.totalUsers,
  )
  const activeListingRate = percent(
    metrics.activeListings,
    metrics.totalListings,
  )
  const completedDeals = data.recentDeals.filter(
    (deal) => deal.status === "completed",
  ).length
  const recentCompletionRate = percent(completedDeals, data.recentDeals.length)

  return (
    <div className="space-y-6">
      <PageHeading
        title="Platform overview"
        description="A live operational summary of users, marketplace activity, revenue and seller stock."
        actions={
          <>
            <Button variant="outline" onClick={() => onNavigate("reports")}>
              View reports
              <ArrowRight />
            </Button>
            <Button onClick={() => onNavigate("users")}>
              Review pending users
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Registered users"
          value={formatNumber(metrics.totalUsers)}
          helper={`${metrics.pendingUsers} accounts awaiting review`}
          icon={Users}
        />
        <MetricCard
          label="Marketplace listings"
          value={formatNumber(metrics.totalListings)}
          helper={`${metrics.activeListings} currently active`}
          icon={ShoppingBasket}
        />
        <MetricCard
          label="Confirmed deals"
          value={formatNumber(metrics.totalDeals)}
          helper="All marketplace transactions"
          icon={Handshake}
        />
        <MetricCard
          label="Deal volume"
          value={formatCurrency(metrics.dealVolume)}
          helper="Excluding cancelled transactions"
          icon={CircleDollarSign}
        />
      </div>

      <div className="grid gap-4 2xl:grid-cols-[1.45fr_0.75fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Marketplace activity</CardTitle>
              <CardDescription className="mt-1">
                Listings and deals by month
              </CardDescription>
            </div>
            <Badge variant="outline">Last 12 months</Badge>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={activityConfig}
              className="h-[330px] w-full"
            >
              <LineChart data={data.activityTrend} margin={{ left: 4, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="listings"
                  stroke="var(--color-listings)"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="deals"
                  stroke="var(--color-deals)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User distribution</CardTitle>
            <CardDescription>Accounts grouped by platform role</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={roleConfig} className="h-[330px] w-full">
              <BarChart data={data.usersByRole} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="role"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={94}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <CardTitle>Operational health</CardTitle>
            <CardDescription>
              Core indicators that require administrator attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={verificationRate}>
              <ProgressLabel>Verified accounts</ProgressLabel>
              <ProgressValue>{verificationRate}%</ProgressValue>
            </Progress>
            <Progress value={activeListingRate}>
              <ProgressLabel>Active listings</ProgressLabel>
              <ProgressValue>{activeListingRate}%</ProgressValue>
            </Progress>
            <Progress value={recentCompletionRate}>
              <ProgressLabel>Recent deal completion</ProgressLabel>
              <ProgressValue>{recentCompletionRate}%</ProgressValue>
            </Progress>

            <div className="grid gap-3 pt-2 sm:grid-cols-2 xl:grid-cols-1">
              <Button
                className="h-auto justify-start gap-3 py-3"
                variant="outline"
                onClick={() => onNavigate("users")}
              >
                <div className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <UserCheck className="size-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{metrics.pendingUsers} pending users</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    Review documents and verification
                  </p>
                </div>
              </Button>
              <Button
                className="h-auto justify-start gap-3 py-3"
                variant="outline"
                onClick={() => onNavigate("inventory")}
              >
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Boxes className="size-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium">
                    {metrics.inventoryItems} available stock items
                  </p>
                  <p className="text-xs font-normal text-muted-foreground">
                    Monitor seller inventory visibility
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Recent marketplace activity</CardTitle>
              <CardDescription className="mt-1">
                Latest listings and confirmed deals
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("deals")}>
              View all
              <ArrowRight />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentDeals.slice(0, 4).map((deal) => (
                  <TableRow key={`deal-${deal._id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Handshake className="size-4" />
                        </div>
                        <div>
                          <p className="font-medium">Marketplace deal</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(deal.quantity)} units
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {compactId(deal._id)}
                    </TableCell>
                    <TableCell>{formatCurrency(deal.totalPrice)}</TableCell>
                    <TableCell>
                      <StatusBadge value={deal.status} />
                    </TableCell>
                    <TableCell>{formatDate(deal.confirmedAt)}</TableCell>
                  </TableRow>
                ))}
                {data.recentListings.slice(0, 4).map((listing) => (
                  <TableRow key={`listing-${listing._id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="grid size-8 place-items-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          <ListChecks className="size-4" />
                        </div>
                        <div>
                          <p className="font-medium">{listing.goodName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(listing.quantity)} {listing.unit}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {compactId(listing._id)}
                    </TableCell>
                    <TableCell>{formatCurrency(listing.minimumPrice)}</TableCell>
                    <TableCell>
                      <StatusBadge value={listing.status} />
                    </TableCell>
                    <TableCell>{formatDate(listing.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
