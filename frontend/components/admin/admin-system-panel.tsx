"use client"

import * as React from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  HardDrive,
  Network,
  RefreshCcw,
  ScrollText,
  ServerCog,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiRequest, type ApiEnvelope } from "@/lib/admin-api"

type Dependency = {
  configured: boolean
  available: boolean
  required: boolean
  bucket?: string
}

type ReadyPayload = {
  status: "ready" | "degraded"
  dependencies: {
    postgresql: Dependency
    redis: Dependency
    qdrant: Dependency
    storage: Dependency
  }
}

type WorkerStatus = {
  queue: string
  available: boolean
  running: boolean
  processed: number
  failed: number
  lastHeartbeatAt?: string
  lastJobAt?: string
  lastError?: string
}

type AuditLog = {
  id: string
  _id?: string
  actorUserId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  metadata?: Record<string, unknown>
  createdAt: string
}

type AuditResponse = {
  data: AuditLog[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNextPage: boolean
  }
}

type AuditFilters = {
  action: string
  entityType: string
  actorUserId: string
  entityId: string
  from: string
  to: string
}

const emptyFilters: AuditFilters = {
  action: "",
  entityType: "",
  actorUserId: "",
  entityId: "",
  from: "",
  to: "",
}

export function AdminSystemPanel({ token }: { token: string }) {
  const [health, setHealth] = React.useState<ReadyPayload | null>(null)
  const [workers, setWorkers] = React.useState<WorkerStatus[]>([])
  const [logs, setLogs] = React.useState<AuditLog[]>([])
  const [pagination, setPagination] = React.useState({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
  })
  const [filters, setFilters] = React.useState<AuditFilters>(emptyFilters)
  const [appliedFilters, setAppliedFilters] =
    React.useState<AuditFilters>(emptyFilters)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const load = React.useCallback(
    async (page = 1, selectedFilters = appliedFilters) => {
      setLoading(true)
      setError("")
      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pagination.pageSize),
      })
      for (const [key, value] of Object.entries(selectedFilters)) {
        if (value.trim()) query.set(key, value.trim())
      }
      try {
        const [healthResponse, auditResponse, workerResponse] =
          await Promise.all([
            apiRequest<ApiEnvelope<ReadyPayload>>(
              "/health/ready",
              {},
              token,
            ),
            apiRequest<AuditResponse>(
              `/admin/audit-logs?${query.toString()}`,
              {},
              token,
            ),
            apiRequest<ApiEnvelope<WorkerStatus[]>>(
              "/admin/workers/status",
              {},
              token,
            ),
          ])
        setHealth(healthResponse.data)
        setLogs(auditResponse.data)
        setPagination(auditResponse.pagination)
        setWorkers(workerResponse.data)
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not load system status",
        )
      } finally {
        setLoading(false)
      }
    },
    [appliedFilters, pagination.pageSize, token],
  )

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(1, emptyFilters)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const dependencies = health
    ? ([
        ["PostgreSQL", health.dependencies.postgresql, Database],
        ["Redis", health.dependencies.redis, Network],
        ["Qdrant", health.dependencies.qdrant, Activity],
        ["Object storage", health.dependencies.storage, HardDrive],
      ] as const)
    : []

  function applyFilters() {
    setAppliedFilters(filters)
    void load(1, filters)
  }

  function clearFilters() {
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    void load(1, emptyFilters)
  }

  async function exportCsv() {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(appliedFilters)) {
      if (value.trim()) query.set(key, value.trim())
    }
    const response = await fetch(
      `/api/backend/admin/audit-logs/export?${query.toString()}`,
      { credentials: "include", cache: "no-store" },
    )
    if (!response.ok) {
      setError("Could not export audit logs")
      return
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "agrivision-audit-logs.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            System health and audit
          </h2>
          <p className="text-sm text-muted-foreground">
            Live dependencies, worker heartbeat and filtered security events.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCcw className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="flex items-center gap-3 py-4 text-sm text-destructive">
            <AlertTriangle className="size-4" />
            {error}
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dependencies.map(([label, dependency, Icon]) => (
          <Card key={label}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <Badge
                  variant={
                    dependency.available
                      ? "default"
                      : dependency.required
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {dependency.available
                    ? "Available"
                    : dependency.configured
                      ? "Unavailable"
                      : "Not configured"}
                </Badge>
              </div>
              <CardTitle className="pt-3 text-lg">{label}</CardTitle>
              <CardDescription>
                {dependency.required
                  ? "Required dependency"
                  : "Optional dependency"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                {dependency.available ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="size-4 text-amber-600" />
                )}
                <span>{dependency.available ? "Healthy" : "Degraded"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ServerCog className="size-5" />
            </span>
            <div>
              <CardTitle>Feature workers</CardTitle>
              <CardDescription>
                AI, notifications, media and reports with heartbeat and DLQ
                tracking.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {workers.map((worker) => (
            <div key={worker.queue} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold capitalize">{worker.queue}</p>
                <Badge
                  variant={worker.running ? "default" : "secondary"}
                >
                  {worker.running ? "Running" : "Stopped"}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted/45 p-2">
                  <p className="text-muted-foreground">Processed</p>
                  <p className="text-lg font-semibold">{worker.processed}</p>
                </div>
                <div className="rounded-lg bg-muted/45 p-2">
                  <p className="text-muted-foreground">Failed</p>
                  <p className="text-lg font-semibold">{worker.failed}</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Heartbeat: {worker.lastHeartbeatAt ? new Date(worker.lastHeartbeatAt).toLocaleString() : "Not received"}
              </p>
              {worker.lastError ? (
                <p className="mt-2 text-xs text-destructive">
                  {worker.lastError}
                </p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <ScrollText className="size-5" />
              </span>
              <div>
                <CardTitle>Audit activity</CardTitle>
                <CardDescription>
                  Filter, paginate and export security-sensitive operations.
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={() => void exportCsv()}>
              <Download /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <FilterInput
              label="Action"
              value={filters.action}
              onChange={(value) => setFilters({ ...filters, action: value })}
            />
            <FilterInput
              label="Entity type"
              value={filters.entityType}
              onChange={(value) =>
                setFilters({ ...filters, entityType: value })
              }
            />
            <FilterInput
              label="Actor user ID"
              value={filters.actorUserId}
              onChange={(value) =>
                setFilters({ ...filters, actorUserId: value })
              }
            />
            <FilterInput
              label="Target entity ID"
              value={filters.entityId}
              onChange={(value) => setFilters({ ...filters, entityId: value })}
            />
            <FilterInput
              label="From"
              type="datetime-local"
              value={filters.from}
              onChange={(value) => setFilters({ ...filters, from: value })}
            />
            <FilterInput
              label="To"
              type="datetime-local"
              value={filters.to}
              onChange={(value) => setFilters({ ...filters, to: value })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={applyFilters}>Apply filters</Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No audit events found.
            </div>
          ) : (
            logs.map((log) => (
              <article
                key={log.id ?? log._id}
                className="rounded-2xl border bg-background/35 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{log.entityType}</Badge>
                      <p className="font-semibold">{log.action}</p>
                    </div>
                    <p className="mt-2 break-all text-xs text-muted-foreground">
                      Actor: {log.actorUserId ?? "system"} · Target:{" "}
                      {log.entityId ?? "n/a"}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </time>
                </div>
                {Object.keys(log.before ?? {}).length > 0 ||
                Object.keys(log.after ?? {}).length > 0 ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <AuditValue label="Before" value={log.before ?? {}} />
                    <AuditValue label="After" value={log.after ?? {}} />
                  </div>
                ) : null}
              </article>
            ))
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total}{" "}
              events
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={pagination.page <= 1 || loading}
                onClick={() => void load(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => void load(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FilterInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div>
      <Label className="mb-2">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function AuditValue({
  label,
  value,
}: {
  label: string
  value: Record<string, unknown>
}) {
  return (
    <div className="rounded-xl bg-muted/45 p-3">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}
