import type * as React from "react"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  className,
}: {
  label: string
  value: React.ReactNode
  helper?: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardDescription>{label}</CardDescription>
          <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        </div>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {helper ? (
        <CardContent className="pt-0 text-xs text-muted-foreground">
          {helper}
        </CardContent>
      ) : null}
    </Card>
  )
}

export function EmptyState({
  title = "No records found",
  description = "Try changing the filters or refreshing the data.",
  onReset,
}: {
  title?: string
  description?: string
  onReset?: () => void
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-5" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onReset ? (
        <Button className="mt-4" variant="outline" onClick={onReset}>
          Reset filters
        </Button>
      ) : null}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[420px] rounded-xl" />
    </div>
  )
}
