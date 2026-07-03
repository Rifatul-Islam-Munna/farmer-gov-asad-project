"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { DashboardData } from "@/lib/admin-api"

const chartConfig = { deals: { label: "Deals", color: "var(--chart-1)" }, listings: { label: "Listings", color: "var(--chart-2)" } } satisfies ChartConfig
const roleConfig = { value: { label: "Users", color: "var(--chart-3)" } } satisfies ChartConfig

export function AdminOverview({data}:{data:DashboardData|null}) { if(!data)return <Card><CardContent className="py-12 text-center">Loading dashboard…</CardContent></Card>; const m=data.metrics; const cards=[["Users",m.totalUsers],["Pending",m.pendingUsers],["Listings",m.totalListings],["Active listings",m.activeListings],["Deals",m.totalDeals],["Deal volume",money(m.dealVolume)],["Stock items",m.inventoryItems]]; return <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([a,b])=><Card key={String(a)}><CardHeader><CardDescription>{a}</CardDescription><CardTitle className="text-3xl">{b}</CardTitle></CardHeader></Card>)}</div><div className="mt-4 grid gap-4 xl:grid-cols-2"><Card><CardHeader><CardTitle>Marketplace activity</CardTitle></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-[300px] w-full"><LineChart data={data.activityTrend}><CartesianGrid vertical={false}/><XAxis dataKey="month"/><YAxis/><ChartTooltip content={<ChartTooltipContent/>}/><Line dataKey="deals" stroke="var(--color-deals)" strokeWidth={2}/><Line dataKey="listings" stroke="var(--color-listings)" strokeWidth={2}/></LineChart></ChartContainer></CardContent></Card><Card><CardHeader><CardTitle>Users by role</CardTitle></CardHeader><CardContent><ChartContainer config={roleConfig} className="h-[300px] w-full"><BarChart data={data.usersByRole}><CartesianGrid vertical={false}/><XAxis dataKey="role"/><YAxis/><ChartTooltip content={<ChartTooltipContent/>}/><Bar dataKey="value" fill="var(--color-value)" radius={6}/></BarChart></ChartContainer></CardContent></Card></div></> }

function money(value:number){return new Intl.NumberFormat("en-BD",{style:"currency",currency:"BDT",maximumFractionDigits:0}).format(value||0)}
