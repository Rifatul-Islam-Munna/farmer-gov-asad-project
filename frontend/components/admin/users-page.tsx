"use client"

import * as React from "react"
import {
  Check,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Store,
  UserCheck,
  Users,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Textarea } from "@/components/ui/textarea"
import type {
  AdminUser,
  UserRole,
  VerificationStatus,
} from "@/lib/admin-api"
import { formatDate, formatNumber, initials } from "@/lib/admin-format"
import { EmptyState, MetricCard, PageHeading } from "./page-elements"
import { StatusBadge } from "./status-badge"

const roles: UserRole[] = [
  "farmer",
  "buyer",
  "agent",
  "medicineSeller",
  "admin",
]
const statuses: VerificationStatus[] = ["pending", "approved", "rejected"]
const PAGE_SIZE = 12

type Change = (
  path: string,
  body: unknown,
  method?: string,
) => Promise<boolean>

export function UsersPage({
  users,
  change,
}: {
  users: AdminUser[]
  change: Change
}) {
  const [query, setQuery] = React.useState("")
  const [role, setRole] = React.useState("all")
  const [status, setStatus] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<AdminUser | null>(null)

  React.useEffect(() => setPage(1), [query, role, status])

  const filtered = React.useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return users.filter((user) => {
      const matchesQuery =
        !normalized ||
        [
          user.name,
          user.phoneNumber,
          user.email,
          user.address,
          user.businessName,
          user.shopName,
        ].some((value) => value?.toLowerCase().includes(normalized))
      return (
        matchesQuery &&
        (role === "all" || user.role === role) &&
        (status === "all" || user.verificationStatus === status)
      )
    })
  }, [query, role, status, users])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pending = users.filter(
    (user) => user.verificationStatus === "pending",
  ).length
  const approved = users.filter(
    (user) => user.verificationStatus === "approved",
  ).length
  const sellers = users.filter(
    (user) => user.role === "medicineSeller",
  ).length

  function reset() {
    setQuery("")
    setRole("all")
    setStatus("all")
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="User management"
        description="Review registrations, verify protected accounts, update roles and maintain profile information."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total accounts"
          value={formatNumber(users.length)}
          helper="All platform roles"
          icon={Users}
        />
        <MetricCard
          label="Pending review"
          value={formatNumber(pending)}
          helper="Require administrator action"
          icon={UserCheck}
        />
        <MetricCard
          label="Approved accounts"
          value={formatNumber(approved)}
          helper="Verified platform access"
          icon={ShieldCheck}
        />
        <MetricCard
          label="Medicine sellers"
          value={formatNumber(sellers)}
          helper="Registered shops"
          icon={Store}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account directory</CardTitle>
          <CardDescription>
            {filtered.length} of {users.length} users match the current filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_190px_190px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search name, phone, email or shop"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Select value={role} onValueChange={(value) => setRole(String(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {roles.map((item) => (
                  <SelectItem key={item} value={item}>
                    {roleLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => setStatus(String(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
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
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Contact and location</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex min-w-52 items-center gap-3">
                          <Avatar size="lg">
                            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                              {initials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.businessName || user.shopName || "Personal account"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{roleLabel(user.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={user.verificationStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="min-w-56 space-y-1 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1.5">
                            <Phone className="size-3" />
                            {user.phoneNumber}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Mail className="size-3" />
                            {user.email || "No email"}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin className="size-3" />
                            {user.address ||
                              (user.location?.latitude != null
                                ? "Phone location saved"
                                : "No location")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {user.verificationStatus !== "approved" ? (
                            <Button
                              size="sm"
                              onClick={() =>
                                void change(`/admin/users/${user._id}`, {
                                  verificationStatus: "approved",
                                })
                              }
                            >
                              <Check />
                              Approve
                            </Button>
                          ) : null}
                          {user.verificationStatus !== "rejected" ? (
                            <Button
                              size="icon-sm"
                              variant="destructive"
                              onClick={() =>
                                void change(`/admin/users/${user._id}`, {
                                  verificationStatus: "rejected",
                                })
                              }
                            >
                              <X />
                              <span className="sr-only">Reject user</span>
                            </Button>
                          ) : null}
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() => setSelected(user)}
                          >
                            <Edit3 />
                            <span className="sr-only">Edit user</span>
                          </Button>
                        </div>
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
            <EmptyState onReset={reset} />
          )}
        </CardContent>
      </Card>

      <EditUserDialog
        user={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        onSave={async (body) => {
          if (!selected) return false
          const saved = await change(`/admin/users/${selected._id}`, body)
          if (saved) setSelected(null)
          return saved
        }}
      />
    </div>
  )
}

function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: {
  user: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (body: Record<string, unknown>) => Promise<boolean>
}) {
  const [form, setForm] = React.useState({
    name: "",
    phoneNumber: "",
    email: "",
    role: "farmer" as UserRole,
    verificationStatus: "pending" as VerificationStatus,
    landAmount: "",
    businessName: "",
    shopName: "",
    address: "",
  })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!user) return
    setForm({
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email ?? "",
      role: user.role,
      verificationStatus: user.verificationStatus,
      landAmount: user.landAmount?.toString() ?? "",
      businessName: user.businessName ?? "",
      shopName: user.shopName ?? "",
      address: user.address ?? "",
    })
  }, [user])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    await onSave({
      name: form.name.trim(),
      phoneNumber: form.phoneNumber.trim(),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      role: form.role,
      verificationStatus: form.verificationStatus,
      ...(form.landAmount ? { landAmount: Number(form.landAmount) } : {}),
      businessName: form.businessName.trim(),
      shopName: form.shopName.trim(),
      address: form.address.trim(),
    })
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Edit user profile</DialogTitle>
            <DialogDescription>
              Update account information, role and verification access.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-5 sm:grid-cols-2">
            <Field label="Full name">
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </Field>
            <Field label="Phone number">
              <Input
                value={form.phoneNumber}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phoneNumber: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field label="Email address">
              <Input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </Field>
            <Field label="Land amount">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.landAmount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    landAmount: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Role">
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    role: String(value) as UserRole,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((item) => (
                    <SelectItem key={item} value={item}>
                      {roleLabel(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Verification status">
              <Select
                value={form.verificationStatus}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    verificationStatus: String(value) as VerificationStatus,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Business name">
              <Input
                value={form.businessName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    businessName: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Shop name">
              <Input
                value={form.shopName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    shopName: event.target.value,
                  }))
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <Textarea
                  rows={3}
                  value={form.address}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function roleLabel(role: UserRole) {
  return role === "medicineSeller"
    ? "Medicine seller"
    : role.charAt(0).toUpperCase() + role.slice(1)
}
