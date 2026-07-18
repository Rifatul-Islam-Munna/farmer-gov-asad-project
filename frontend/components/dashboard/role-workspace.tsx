import {
  Activity,
  BadgeCheck,
  BellRing,
  Boxes,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardCheck,
  CloudSun,
  Handshake,
  HeartPulse,
  Leaf,
  MapPin,
  MessageSquareText,
  PackageSearch,
  ScanLine,
  Settings2,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Store,
  Tractor,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type WorkspaceRole =
  | "farmer"
  | "buyer"
  | "wholesale-buyer"
  | "seller"
  | "machinery-seller"
  | "medicine-seller"
  | "agent"
  | "agriculture-specialist"
  | "veterinary-doctor"
  | "government-officer"
  | "support"

type WorkspaceAction = {
  title: string
  description: string
  icon: LucideIcon
  status?: string
}

type WorkspaceConfig = {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  metrics: Array<{ label: string; value: string; note: string }>
  actions: WorkspaceAction[]
  activity: Array<{ title: string; detail: string; time: string }>
}

const commonActivity = [
  { title: "Weather advisory updated", detail: "Rain risk increased for your selected area.", time: "12 min" },
  { title: "Marketplace prices refreshed", detail: "Latest reference prices are available.", time: "34 min" },
  { title: "Account security checked", detail: "No unusual sign-in activity found.", time: "Today" },
]

const configs: Record<WorkspaceRole, WorkspaceConfig> = {
  farmer: {
    eyebrow: "Farm operations",
    title: "Run your farm from one clear workspace",
    description: "Track crop health, scan symptoms, sell harvests, review alerts and manage daily farm work.",
    icon: Sprout,
    metrics: [
      { label: "Active crops", value: "06", note: "2 need review" },
      { label: "Open listings", value: "04", note: "1 new offer" },
      { label: "Farm health", value: "82%", note: "Stable this week" },
      { label: "Weather alerts", value: "02", note: "Heat and rain" },
    ],
    actions: [
      { title: "Scan crop", description: "Capture symptoms and start diagnosis.", icon: ScanLine, status: "AI" },
      { title: "Sell harvest", description: "Create a crop or farm-output listing.", icon: Store },
      { title: "Farm records", description: "Review crops, livestock and expenses.", icon: ClipboardCheck },
      { title: "Weather plan", description: "See field-ready weather actions.", icon: CloudSun },
      { title: "Find equipment", description: "Browse machinery, parts and rentals.", icon: Tractor },
      { title: "Ask specialist", description: "Start a consultation or message.", icon: MessageSquareText },
    ],
    activity: commonActivity,
  },
  buyer: {
    eyebrow: "Crop marketplace",
    title: "Source verified farm products faster",
    description: "Search by crop, location, grade, quantity and price, then negotiate directly with farmers.",
    icon: ShoppingBasket,
    metrics: [
      { label: "Saved searches", value: "08", note: "3 new matches" },
      { label: "Open offers", value: "05", note: "2 awaiting reply" },
      { label: "Active orders", value: "03", note: "1 in delivery" },
      { label: "Suppliers", value: "21", note: "Verified farmers" },
    ],
    actions: [
      { title: "Browse crops", description: "Use advanced marketplace filters.", icon: PackageSearch },
      { title: "Compare listings", description: "Compare price, grade and distance.", icon: ChartNoAxesCombined },
      { title: "Offers", description: "Review and counter active offers.", icon: Handshake },
      { title: "Deliveries", description: "Track confirmed farm orders.", icon: Truck },
      { title: "Saved suppliers", description: "Open preferred farmer profiles.", icon: Users },
      { title: "Messages", description: "Continue buyer-farmer conversations.", icon: MessageSquareText },
    ],
    activity: commonActivity,
  },
  "wholesale-buyer": {
    eyebrow: "Bulk procurement",
    title: "Manage high-volume agricultural sourcing",
    description: "Create bulk requirements, compare regional supply and track wholesale negotiations and delivery.",
    icon: Building2,
    metrics: [
      { label: "Bulk requests", value: "07", note: "4 active" },
      { label: "Supply offers", value: "18", note: "Across 6 districts" },
      { label: "Committed volume", value: "42t", note: "This month" },
      { label: "Deliveries", value: "09", note: "2 arriving today" },
    ],
    actions: [
      { title: "Create requirement", description: "Publish a bulk crop requirement.", icon: ClipboardCheck },
      { title: "Regional supply", description: "Compare volume by district.", icon: MapPin },
      { title: "Negotiations", description: "Manage multi-seller offers.", icon: Handshake },
      { title: "Logistics", description: "Coordinate pickup and delivery.", icon: Truck },
      { title: "Supplier network", description: "Review verified farmer groups.", icon: Users },
      { title: "Reports", description: "Analyze purchase price and volume.", icon: ChartNoAxesCombined },
    ],
    activity: commonActivity,
  },
  seller: {
    eyebrow: "Seller commerce",
    title: "Operate your agricultural storefront",
    description: "Manage products, stock, orders, delivery coverage, customer messages and seller performance.",
    icon: Store,
    metrics: [
      { label: "Products", value: "38", note: "31 active" },
      { label: "Low stock", value: "06", note: "Needs attention" },
      { label: "Orders", value: "12", note: "4 new today" },
      { label: "Seller rating", value: "4.8", note: "126 reviews" },
    ],
    actions: [
      { title: "Add product", description: "Create a new approved product.", icon: Boxes },
      { title: "Inventory", description: "Update stock, unit and pricing.", icon: ClipboardCheck },
      { title: "Orders", description: "Process and fulfil customer orders.", icon: ShoppingBasket },
      { title: "Delivery areas", description: "Set supported service regions.", icon: MapPin },
      { title: "Messages", description: "Answer farmer and buyer questions.", icon: MessageSquareText },
      { title: "Analytics", description: "Review sales and conversion.", icon: ChartNoAxesCombined },
    ],
    activity: commonActivity,
  },
  "machinery-seller": {
    eyebrow: "Machinery commerce",
    title: "Sell, rent and service farm machinery",
    description: "Publish machinery, spare parts and rental offers with specifications, service areas and availability.",
    icon: Tractor,
    metrics: [
      { label: "Machines", value: "24", note: "19 available" },
      { label: "Rental units", value: "08", note: "3 currently hired" },
      { label: "Parts", value: "112", note: "14 low stock" },
      { label: "Service requests", value: "07", note: "2 urgent" },
    ],
    actions: [
      { title: "Add machinery", description: "Enter brand, model and capacity.", icon: Tractor },
      { title: "Rental calendar", description: "Manage availability and bookings.", icon: CalendarDays },
      { title: "Spare parts", description: "Maintain compatible parts stock.", icon: Boxes },
      { title: "Service coverage", description: "Set installation and repair areas.", icon: MapPin },
      { title: "Orders", description: "Manage sales and rental orders.", icon: Truck },
      { title: "Performance", description: "Track enquiries and revenue.", icon: ChartNoAxesCombined },
    ],
    activity: commonActivity,
  },
  "medicine-seller": {
    eyebrow: "Input and medicine shop",
    title: "Keep nearby farms supplied safely",
    description: "Maintain approved products, stock, pricing, shop location and farmer availability.",
    icon: HeartPulse,
    metrics: [
      { label: "Products", value: "46", note: "41 available" },
      { label: "Low stock", value: "05", note: "Restock soon" },
      { label: "Farmer enquiries", value: "13", note: "Today" },
      { label: "Coverage", value: "18km", note: "Current radius" },
    ],
    actions: [
      { title: "Inventory", description: "Update medicine and input stock.", icon: Boxes },
      { title: "Shop location", description: "Confirm map and service radius.", icon: MapPin },
      { title: "Product approval", description: "Review restricted product status.", icon: BadgeCheck },
      { title: "Orders", description: "Prepare farmer purchases.", icon: ShoppingBasket },
      { title: "Messages", description: "Respond to product enquiries.", icon: MessageSquareText },
      { title: "Settings", description: "Manage shop and notification settings.", icon: Settings2 },
    ],
    activity: commonActivity,
  },
  agent: {
    eyebrow: "Farmer assistance",
    title: "Help farmers complete digital services",
    description: "Register farmers, prepare listings and track assisted actions with farmer OTP consent.",
    icon: Users,
    metrics: [
      { label: "Farmers assisted", value: "28", note: "This month" },
      { label: "Pending OTP", value: "03", note: "Expires soon" },
      { label: "Listings created", value: "17", note: "14 published" },
      { label: "Completion rate", value: "94%", note: "Verified actions" },
    ],
    actions: [
      { title: "Register farmer", description: "Start assisted registration.", icon: Users },
      { title: "Create listing", description: "Prepare a farmer-authorized sale.", icon: Store },
      { title: "Pending consent", description: "Review OTP-required actions.", icon: ShieldCheck },
      { title: "Activity history", description: "Inspect assisted action records.", icon: Activity },
      { title: "Farmer search", description: "Find existing farmer accounts.", icon: PackageSearch },
      { title: "Support", description: "Report an assistance problem.", icon: MessageSquareText },
    ],
    activity: commonActivity,
  },
  "agriculture-specialist": {
    eyebrow: "Crop advisory",
    title: "Review cases and guide farmers clearly",
    description: "Assess crop symptoms, review AI evidence and provide practical treatment and prevention guidance.",
    icon: Leaf,
    metrics: [
      { label: "Open cases", value: "16", note: "5 high priority" },
      { label: "Reviewed today", value: "09", note: "Average 12 min" },
      { label: "Follow-ups", value: "07", note: "Due this week" },
      { label: "Farmer rating", value: "4.9", note: "214 reviews" },
    ],
    actions: [
      { title: "Case queue", description: "Review new crop cases.", icon: ClipboardCheck },
      { title: "AI evidence", description: "Inspect vector and AI results.", icon: ScanLine },
      { title: "Consultations", description: "Answer scheduled farmer sessions.", icon: MessageSquareText },
      { title: "Follow-ups", description: "Track treatment progress.", icon: CalendarDays },
      { title: "Knowledge notes", description: "Maintain approved guidance.", icon: Leaf },
      { title: "Performance", description: "Review case outcomes.", icon: ChartNoAxesCombined },
    ],
    activity: commonActivity,
  },
  "veterinary-doctor": {
    eyebrow: "Animal health",
    title: "Manage livestock and poultry consultations",
    description: "Review animal health cases, vaccination history, symptoms and farmer follow-up requirements.",
    icon: HeartPulse,
    metrics: [
      { label: "Open cases", value: "11", note: "3 urgent" },
      { label: "Appointments", value: "06", note: "Today" },
      { label: "Follow-ups", value: "08", note: "This week" },
      { label: "Resolved", value: "87%", note: "Last 30 days" },
    ],
    actions: [
      { title: "Case queue", description: "Review animal health requests.", icon: ClipboardCheck },
      { title: "Appointments", description: "Open scheduled consultations.", icon: CalendarDays },
      { title: "Vaccination", description: "Review schedules and reminders.", icon: BellRing },
      { title: "Farmer messages", description: "Answer health follow-ups.", icon: MessageSquareText },
      { title: "Treatment notes", description: "Record professional guidance.", icon: HeartPulse },
      { title: "Reports", description: "Review case trends and outcomes.", icon: ChartNoAxesCombined },
    ],
    activity: commonActivity,
  },
  "government-officer": {
    eyebrow: "Public agriculture operations",
    title: "Monitor services, risks and regional activity",
    description: "Review farmer participation, regional alerts, market activity and public-service performance.",
    icon: Building2,
    metrics: [
      { label: "Registered farmers", value: "18.4k", note: "Across 12 regions" },
      { label: "Active alerts", value: "07", note: "2 severe" },
      { label: "Market listings", value: "3.1k", note: "This month" },
      { label: "Service cases", value: "284", note: "91% resolved" },
    ],
    actions: [
      { title: "Regional overview", description: "Compare district activity.", icon: MapPin },
      { title: "Weather alerts", description: "Review public hazard status.", icon: CloudSun },
      { title: "Farmer services", description: "Monitor service adoption.", icon: Users },
      { title: "Market oversight", description: "Inspect prices and supply.", icon: ChartNoAxesCombined },
      { title: "Announcements", description: "Publish verified guidance.", icon: BellRing },
      { title: "Reports", description: "Export operational summaries.", icon: ClipboardCheck },
    ],
    activity: commonActivity,
  },
  support: {
    eyebrow: "Customer support",
    title: "Resolve user problems without losing context",
    description: "Review tickets, account issues, provider incidents and marketplace disputes in one queue.",
    icon: MessageSquareText,
    metrics: [
      { label: "Open tickets", value: "34", note: "6 urgent" },
      { label: "Waiting users", value: "12", note: "Oldest 18 min" },
      { label: "Resolved today", value: "41", note: "93% satisfaction" },
      { label: "Incidents", value: "02", note: "Providers degraded" },
    ],
    actions: [
      { title: "Ticket queue", description: "Open unresolved support cases.", icon: MessageSquareText },
      { title: "Account lookup", description: "Find user and role status.", icon: Users },
      { title: "Marketplace disputes", description: "Review buyer-seller issues.", icon: Handshake },
      { title: "Provider status", description: "Check Redis, Qdrant and AI health.", icon: Activity },
      { title: "Knowledge base", description: "Use approved support answers.", icon: ClipboardCheck },
      { title: "Escalations", description: "Assign technical or admin review.", icon: ShieldCheck },
    ],
    activity: commonActivity,
  },
}

export function RoleWorkspace({ role }: { role: WorkspaceRole }) {
  const config = configs[role]
  const HeroIcon = config.icon

  return (
    <main className="app-shell min-h-screen px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6 md:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1">
                <HeroIcon className="mr-1.5 size-3.5" />
                {config.eyebrow}
              </Badge>
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-6xl">
                {config.title}
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
                {config.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="lg" className="rounded-2xl">
                Open primary task
                <ChevronRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl">
                <Settings2 className="size-4" />
                Workspace settings
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {config.metrics.map((metric) => (
            <Card key={metric.label} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-3xl tracking-tight">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-medium text-muted-foreground">{metric.note}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Start the most common work for this role.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {config.actions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.title}
                    type="button"
                    className="group rounded-2xl border bg-background/35 p-4 text-left transition hover:-translate-y-0.5 hover:bg-background/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/15">
                        <Icon className="size-5" />
                      </span>
                      {action.status ? <Badge variant="outline">{action.status}</Badge> : null}
                    </div>
                    <h2 className="mt-4 font-semibold">{action.title}</h2>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{action.description}</p>
                    <div className="mt-4 flex items-center text-xs font-semibold text-primary">
                      Open
                      <ChevronRight className="ml-1 size-3.5 transition group-hover:translate-x-0.5" />
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest operational updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.activity.map((item, index) => (
                <div key={item.title} className="flex gap-3 rounded-2xl border bg-background/30 p-3.5">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    {index === 0 ? <BellRing className="size-4" /> : index === 1 ? <ChartNoAxesCombined className="size-4" /> : <ShieldCheck className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
