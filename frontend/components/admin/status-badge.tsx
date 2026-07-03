import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const positive = new Set([
  "approved",
  "active",
  "published",
  "completed",
  "confirmed",
  "sold",
])
const warning = new Set([
  "pending",
  "pendingOtp",
  "reserved",
  "countered",
  "acceptedByBuyer",
  "acceptedByFarmer",
])
const negative = new Set([
  "rejected",
  "cancelled",
  "expired",
  "disputed",
  "inactive",
])

export function StatusBadge({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const normalized = value || "unknown"
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        positive.has(normalized) &&
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
        warning.has(normalized) &&
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
        negative.has(normalized) &&
          "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
        className,
      )}
    >
      {normalized.replace(/([A-Z])/g, " $1")}
    </Badge>
  )
}
